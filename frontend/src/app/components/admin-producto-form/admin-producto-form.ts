import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../../../services/producto.service';
import imageCompression from 'browser-image-compression';

interface ImagenAdmin {
  id?: string | number;
  url: string;
  esPrincipal: boolean;
  nueva?: boolean;
}

@Component({
  selector: 'app-admin-producto-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-producto-form.html',
  styleUrl: './admin-producto-form.css'
})
export class AdminProductoFormComponent implements OnInit {
  modoEdicion = false;

  producto = {
    id: '',
    nombre: '',
    precio: 0,
    stock: 0,
    categoriaId: '',
    marcaId: '',
    proveedorId: '',
    descripcion: '',
    imagen: '',
    estado: true,
    sku: ''
  };

  categorias: any[] = [];
  marcas: any[] = [];
  proveedores: any[] = [];

  imagenesProducto: ImagenAdmin[] = [];
  imagenPrincipalIndex = 0;

  mensaje = '';
  mensajeError = '';
  cargando = false;

  constructor(
    private productoService: ProductoService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarAuxiliares();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.modoEdicion = true;
      this.cargarProductoPorId(id);
    } else {
      this.modoEdicion = false;
      this.prepararFormularioNuevo();
    }
  }

  prepararFormularioNuevo(): void {
    this.producto = {
      id: '',
      nombre: '',
      precio: 0,
      stock: 0,
      categoriaId: '',
      marcaId: '',
      proveedorId: '',
      descripcion: '',
      imagen: '',
      estado: true,
      sku: ''
    };

    this.imagenesProducto = [];
    this.imagenPrincipalIndex = 0;
  }

  cargarProductoPorId(id: string): void {
    this.cargando = true;
    this.mensaje = '';
    this.mensajeError = '';

    this.productoService.obtenerProductoPorId(id).subscribe({
      next: (respuesta: any) => {
        this.cargando = false;

        const producto = respuesta.data || respuesta;

        this.producto = {
          id: this.obtenerId(producto),
          nombre: producto.Nombre || producto.nombre || '',
          precio: Number(producto.Precio || producto.precio || 0),
          stock: Number(producto.Stock || producto.stock || 0),
          categoriaId: String(producto.CategoriaID || producto.categoriaId || producto.CategoriaId || ''),
          marcaId: String(producto.MarcaID || producto.marcaId || producto.MarcaId || ''),
          proveedorId: String(producto.ProveedorID || producto.proveedorId || producto.ProveedorId || ''),
          descripcion: producto.Descripcion || producto.descripcion || '',
          imagen: producto.Imagen || producto.imagen || '',
          estado: this.obtenerEstado(producto),
          sku: producto.SKU || producto.sku || ''
        };

        this.cargarImagenesProducto();
      },
      error: (error: any) => {
        this.cargando = false;
        this.mensajeError = error.error?.mensaje || 'No se pudo cargar el producto.';
      }
    });
  }

  cargarAuxiliares(): void {
    this.productoService.obtenerCategorias().subscribe({
      next: (respuesta: any) => {
        const datos = respuesta.data || respuesta || [];
        this.categorias = datos.map((c: any) => ({
          id: c.CategoriaID || c.categoriaId || c.CategoriaId || c.id,
          nombre: c.Nombre || c.nombre
        }));
      }
    });

    this.productoService.obtenerMarcas().subscribe({
      next: (respuesta: any) => {
        const datos = respuesta.data || respuesta || [];
        this.marcas = datos.map((m: any) => ({
          id: m.MarcaID || m.marcaId || m.MarcaId || m.id,
          nombre: m.Nombre || m.nombre
        }));
      }
    });

    this.productoService.obtenerProveedores().subscribe({
      next: (respuesta: any) => {
        const datos = respuesta.data || respuesta || [];
        this.proveedores = datos.map((p: any) => ({
          id: p.ProveedorID || p.proveedorId || p.ProveedorId || p.id,
          nombre: p.Nombre || p.nombre
        }));
      }
    });
  }

  cargarImagenesProducto(): void {
    if (!this.producto.id) return;

    this.productoService.obtenerImagenesProducto(this.producto.id).subscribe({
      next: (respuesta: any) => {
        const datos = respuesta.data || respuesta || [];

        this.imagenesProducto = datos.map((img: any) => ({
          id: img.IdImagen || img.ImagenProductoID || img._id,
          url: this.normalizarImagen(img.UrlImagen || img.urlImagen || ''),
          esPrincipal: Boolean(img.EsPrincipal || img.esPrincipal),
          nueva: false
        }));

        const indexPrincipal = this.imagenesProducto.findIndex(img => img.esPrincipal);
        this.imagenPrincipalIndex = indexPrincipal >= 0 ? indexPrincipal : 0;
      },
      error: () => {
        this.imagenesProducto = [];
      }
    });
  }

  async comprimirImagen(archivo: File): Promise<File> {
    const opciones = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 900,
      useWebWorker: true,
      fileType: 'image/webp'
    };

    try {
      const imagenComprimida = await imageCompression(archivo, opciones);
      return imagenComprimida;
    } catch (error) {
      console.error('Error al comprimir imagen:', error);
      return archivo;
    }
  }

  async seleccionarImagenes(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const archivos = Array.from(input.files || []);

    if (archivos.length === 0) return;

    this.mensajeError = '';

    const cantidadActual = this.imagenesProducto.length;
    const disponibles = 5 - cantidadActual;

    if (disponibles <= 0) {
      this.mensajeError = 'Solo puedes registrar un máximo de 5 imágenes por producto.';
      input.value = '';
      return;
    }

    if (archivos.length > disponibles) {
      this.mensajeError = `Solo puedes agregar ${disponibles} imagen(es) más.`;
      input.value = '';
      return;
    }

    for (const archivo of archivos) {
      if (!archivo.type.startsWith('image/')) {
        this.mensajeError = 'Solo se permiten archivos de imagen.';
        continue;
      }

      const pesoMaximoOriginalMB = 8;

      if (archivo.size > pesoMaximoOriginalMB * 1024 * 1024) {
        this.mensajeError = `La imagen ${archivo.name} es demasiado pesada. Máximo ${pesoMaximoOriginalMB} MB.`;
        continue;
      }

      const imagenComprimida = await this.comprimirImagen(archivo);

      const lector = new FileReader();

      lector.onload = () => {
        this.imagenesProducto.push({
          url: String(lector.result),
          esPrincipal: this.imagenesProducto.length === 0,
          nueva: true
        });

        if (this.imagenesProducto.length === 1) {
          this.imagenPrincipalIndex = 0;
          this.seleccionarPrincipal(0);
        }
      };

      lector.readAsDataURL(imagenComprimida);
    }

    input.value = '';
  }

  seleccionarPrincipal(index: number): void {
    this.imagenPrincipalIndex = index;

    this.imagenesProducto = this.imagenesProducto.map((img, i) => ({
      ...img,
      esPrincipal: i === index
    }));
  }

  eliminarImagen(index: number): void {
    const imagen = this.imagenesProducto[index];

    if (!imagen) return;

    if (imagen.id && !imagen.nueva) {
      const confirmar = confirm('¿Deseas eliminar esta imagen guardada?');

      if (!confirmar) return;

      this.productoService.eliminarImagenProducto(imagen.id).subscribe({
        next: () => {
          this.imagenesProducto.splice(index, 1);

          if (this.imagenPrincipalIndex >= this.imagenesProducto.length) {
            this.imagenPrincipalIndex = 0;
          }

          if (this.imagenesProducto.length > 0) {
            this.seleccionarPrincipal(this.imagenPrincipalIndex);
          }
        },
        error: () => {
          this.mensajeError = 'No se pudo eliminar la imagen.';
        }
      });

      return;
    }

    this.imagenesProducto.splice(index, 1);

    if (this.imagenPrincipalIndex >= this.imagenesProducto.length) {
      this.imagenPrincipalIndex = 0;
    }

    if (this.imagenesProducto.length > 0) {
      this.seleccionarPrincipal(this.imagenPrincipalIndex);
    }
  }

  guardarProducto(): void {
    this.mensaje = '';
    this.mensajeError = '';

    if (
      !this.producto.nombre.trim() ||
      !this.producto.precio ||
      !this.producto.categoriaId ||
      !this.producto.marcaId ||
      !this.producto.proveedorId
    ) {
      this.mensajeError = 'Completa todos los campos obligatorios.';
      return;
    }

    if (this.imagenesProducto.length > 5) {
      this.mensajeError = 'Solo se permiten 5 imágenes como máximo.';
      return;
    }

    const data = {
      ProductoID: this.producto.id,
      Nombre: this.producto.nombre.trim(),
      Precio: Number(this.producto.precio),
      Stock: Number(this.producto.stock),
      CategoriaID: Number(this.producto.categoriaId),
      MarcaID: Number(this.producto.marcaId),
      ProveedorID: Number(this.producto.proveedorId),
      Descripcion: this.producto.descripcion.trim(),
      Imagen: this.producto.imagen,
      Estado: Boolean(this.producto.estado),
      SKU: this.producto.sku || `PRD-${Date.now()}`
    };

    const peticion = this.modoEdicion
      ? this.productoService.actualizarProducto(data)
      : this.productoService.crearProducto(data);

    peticion.subscribe({
      next: async (respuesta: any) => {
        const productoGuardado = respuesta.data || respuesta;
        const productoId = productoGuardado.ProductoID || productoGuardado.productoId || this.producto.id;

        try {
          await this.guardarImagenes(productoId);
        } catch (error) {
          console.error('Error al guardar imágenes:', error);
        }

        this.mensaje = this.modoEdicion
          ? 'Producto actualizado correctamente.'
          : 'Producto registrado correctamente.';

        setTimeout(() => {
          this.cancelar();
        }, 800);
      },
      error: (error: any) => {
        this.mensajeError = error.error?.mensaje || 'No se pudo guardar el producto.';
      }
    });
  }

  async guardarImagenes(productoId: string | number): Promise<void> {
    const imagenesNuevas = this.imagenesProducto.filter(img => img.nueva);

    for (let i = 0; i < imagenesNuevas.length; i++) {
      const imagen = imagenesNuevas[i];

      await this.productoService.agregarImagenProducto({
        ProductoID: productoId,
        UrlImagen: imagen.url,
        EsPrincipal: this.imagenesProducto.indexOf(imagen) === this.imagenPrincipalIndex
      }).toPromise();
    }

    const imagenPrincipal = this.imagenesProducto[this.imagenPrincipalIndex];

    if (imagenPrincipal?.id && !imagenPrincipal.nueva) {
      await this.productoService.marcarImagenPrincipal(imagenPrincipal.id).toPromise();
    }
  }

  cancelar(): void {
    this.router.navigate(['/admin/productos']);
  }

  obtenerId(producto: any): string {
    return String(
      producto?.ProductoID ??
      producto?.productoID ??
      producto?.ProductoId ??
      producto?.productoId ??
      producto?._id ??
      producto?.id ??
      ''
    );
  }

  obtenerEstado(producto: any): boolean {
    if (producto?.Estado !== undefined) return Boolean(producto.Estado);
    if (producto?.estado !== undefined) return Boolean(producto.estado);
    return true;
  }

  normalizarImagen(imagen: string): string {
    if (!imagen) return 'assets/img/EasyCommerce.png';
    if (imagen.startsWith('http')) return imagen;
    if (imagen.startsWith('data:image')) return imagen;
    if (imagen.startsWith('assets/')) return imagen;
    if (imagen.startsWith('/')) return `https://easycommerce.onrender.com${imagen}`;
    return imagen;
  }
}