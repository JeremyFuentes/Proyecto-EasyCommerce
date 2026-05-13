import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';

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
export class AdminProductoFormComponent implements OnChanges {
  @Input() productoSeleccionado: any | null = null;
  @Input() volver!: () => void;
  @Input() crearProducto!: () => void;
  @Input() cambiarVista!: (vista: string) => void;
  @Input() vistaActual = '';

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

  constructor(private productoService: ProductoService) {
    this.cargarAuxiliares();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productoSeleccionado']) {
      this.prepararFormulario();
    }
  }

  prepararFormulario(): void {
    this.mensaje = '';
    this.mensajeError = '';

    if (this.productoSeleccionado) {
      this.modoEdicion = true;

      this.producto = {
        id: this.obtenerId(this.productoSeleccionado),
        nombre: this.productoSeleccionado.Nombre || this.productoSeleccionado.nombre || '',
        precio: Number(this.productoSeleccionado.Precio || this.productoSeleccionado.precio || 0),
        stock: Number(this.productoSeleccionado.Stock || this.productoSeleccionado.stock || 0),
        categoriaId: String(this.productoSeleccionado.CategoriaID || this.productoSeleccionado.categoriaId || ''),
        marcaId: String(this.productoSeleccionado.MarcaID || this.productoSeleccionado.marcaId || ''),
        proveedorId: String(this.productoSeleccionado.ProveedorID || this.productoSeleccionado.proveedorId || ''),
        descripcion: this.productoSeleccionado.Descripcion || this.productoSeleccionado.descripcion || '',
        imagen: this.productoSeleccionado.Imagen || this.productoSeleccionado.imagen || '',
        estado: this.obtenerEstado(this.productoSeleccionado),
        sku: this.productoSeleccionado.SKU || this.productoSeleccionado.sku || ''
      };

      this.cargarImagenesProducto();
      return;
    }

    this.modoEdicion = false;
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

  cargarAuxiliares(): void {
    this.productoService.obtenerCategorias().subscribe({
      next: (respuesta: any) => {
        const datos = respuesta.data || respuesta || [];
        this.categorias = datos.map((c: any) => ({
          id: c.CategoriaID || c.categoriaId || c.id,
          nombre: c.Nombre || c.nombre
        }));
      }
    });

    this.productoService.obtenerMarcas().subscribe({
      next: (respuesta: any) => {
        const datos = respuesta.data || respuesta || [];
        this.marcas = datos.map((m: any) => ({
          id: m.MarcaID || m.marcaId || m.id,
          nombre: m.Nombre || m.nombre
        }));
      }
    });

    this.productoService.obtenerProveedores().subscribe({
      next: (respuesta: any) => {
        const datos = respuesta.data || respuesta || [];
        this.proveedores = datos.map((p: any) => ({
          id: p.ProveedorID || p.proveedorId || p.id,
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
          id: img.IdImagen || img._id,
          url: this.normalizarImagen(img.UrlImagen || img.urlImagen || ''),
          esPrincipal: Boolean(img.EsPrincipal),
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

  seleccionarImagenes(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivos = Array.from(input.files || []);

    if (archivos.length === 0) return;

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

    archivos.forEach((archivo) => {
      const lector = new FileReader();

      lector.onload = () => {
        this.imagenesProducto.push({
          url: String(lector.result),
          esPrincipal: this.imagenesProducto.length === 0,
          nueva: true
        });

        if (this.imagenesProducto.length === 1) {
          this.imagenPrincipalIndex = 0;
        }
      };

      lector.readAsDataURL(archivo);
    });

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

          this.seleccionarPrincipal(this.imagenPrincipalIndex);
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

    if (!this.producto.nombre || !this.producto.precio || !this.producto.categoriaId || !this.producto.marcaId || !this.producto.proveedorId) {
      this.mensajeError = 'Completa todos los campos obligatorios.';
      return;
    }

    if (this.imagenesProducto.length > 5) {
      this.mensajeError = 'Solo se permiten 5 imágenes como máximo.';
      return;
    }

    const data = {
      ProductoID: this.producto.id,
      Nombre: this.producto.nombre,
      Precio: Number(this.producto.precio),
      Stock: Number(this.producto.stock),
      CategoriaID: Number(this.producto.categoriaId),
      MarcaID: Number(this.producto.marcaId),
      ProveedorID: Number(this.producto.proveedorId),
      Descripcion: this.producto.descripcion,
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
        const productoId = productoGuardado.ProductoID || this.producto.id;

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
    this.productoSeleccionado = null;
    this.mensaje = '';
    this.mensajeError = '';

    if (this.volver) {
      this.volver();
      return;
    }

    if (this.cambiarVista) {
      this.cambiarVista('admin-productos');
      return;
    }

    console.warn('No se recibió volver ni cambiarVista en admin-producto-form');
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
    if (imagen.startsWith('/')) return `http://localhost:3000${imagen}`;
    return imagen;
  }
}