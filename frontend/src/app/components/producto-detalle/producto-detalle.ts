import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../services/producto.service';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './producto-detalle.html',
  styleUrl: './producto-detalle.css'
})
export class ProductoDetalleComponent implements OnChanges {
  @Input() productoSeleccionado: any | null = null;
  @Input() cambiarVista!: (vista: string) => void;

  producto: any | null = null;
  productosRelacionados: any[] = [];

  cantidad = 1;
  imagenPrincipal = 'assets/img/EasyCommerce.png';
  imagenesProducto: string[] = [];

  mostrarModalLogin = false;
  mensaje = '';
  mensajeError = '';
  accionPendiente = '';
  cargando = false;

  esFavorito = false;
  cargandoFavorito = false;

  constructor(private productoService: ProductoService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productoSeleccionado']) {
      this.cargarDetalleProducto();
    }
  }

  cargarDetalleProducto(): void {
    this.mensaje = '';
    this.mensajeError = '';
    this.cantidad = 1;
    this.esFavorito = false;

    if (!this.productoSeleccionado) {
      this.producto = null;
      return;
    }

    const id = this.obtenerId(this.productoSeleccionado);

    if (!id) {
      this.producto = this.productoSeleccionado;
      this.prepararImagenesDesdeProducto();
      this.cargarProductosRelacionados();
      return;
    }

    this.cargando = true;

    this.productoService.obtenerProductoPorId(id).subscribe({
      next: (respuesta: any) => {
        this.cargando = false;

        this.producto = respuesta?.data || respuesta || this.productoSeleccionado;

        this.cargarImagenesProducto();
        this.cargarProductosRelacionados();
        this.verificarSiEsFavorito();
      },
      error: () => {
        this.cargando = false;

        this.producto = this.productoSeleccionado;

        this.cargarImagenesProducto();
        this.cargarProductosRelacionados();
        this.verificarSiEsFavorito();
      }
    });
  }

  cargarImagenesProducto(): void {
    if (!this.producto) {
      this.prepararImagenesDesdeProducto();
      return;
    }

    const productoId = this.obtenerId(this.producto);

    if (!productoId) {
      this.prepararImagenesDesdeProducto();
      return;
    }

    this.productoService.obtenerImagenesProducto(productoId).subscribe({
      next: (respuesta: any) => {
        const imagenes = Array.isArray(respuesta)
          ? respuesta
          : respuesta.data || [];

        if (!imagenes || imagenes.length === 0) {
          this.prepararImagenesDesdeProducto();
          return;
        }

        const imagenPrincipal = imagenes.find((img: any) =>
          img.EsPrincipal === true ||
          img.esPrincipal === true ||
          img.EsPrincipal === 1 ||
          img.esPrincipal === 1
        );

        this.imagenesProducto = imagenes.map((img: any) =>
          this.normalizarImagen(
            img.UrlImagen ||
            img.urlImagen ||
            img.url ||
            img.Imagen ||
            img.imagen ||
            ''
          )
        );

        if (imagenPrincipal) {
          this.imagenPrincipal = this.normalizarImagen(
            imagenPrincipal.UrlImagen ||
            imagenPrincipal.urlImagen ||
            imagenPrincipal.url ||
            imagenPrincipal.Imagen ||
            imagenPrincipal.imagen ||
            ''
          );
        } else {
          this.imagenPrincipal = this.imagenesProducto[0] || this.obtenerImagen(this.producto);
        }
      },
      error: () => {
        this.prepararImagenesDesdeProducto();
      }
    });
  }

  prepararImagenesDesdeProducto(): void {
    const imagen = this.obtenerImagen(this.producto);

    this.imagenPrincipal = imagen;

    const posiblesImagenes = this.obtenerImagenesLocalesProducto(this.producto);

    if (posiblesImagenes.length > 0) {
      this.imagenesProducto = posiblesImagenes;
    } else {
      this.imagenesProducto = [imagen];
    }
  }

  obtenerImagenesLocalesProducto(producto: any): string[] {
    if (!producto) return [];

    if (Array.isArray(producto.Imagenes)) {
      return producto.Imagenes.map((img: any) =>
        this.normalizarImagen(img.url || img.Url || img.Imagen || img.imagen || img)
      );
    }

    if (Array.isArray(producto.imagenes)) {
      return producto.imagenes.map((img: any) =>
        this.normalizarImagen(img.url || img.Url || img.Imagen || img.imagen || img)
      );
    }

    if (Array.isArray(producto.imagenesProducto)) {
      return producto.imagenesProducto.map((img: any) =>
        this.normalizarImagen(img.urlImagen || img.UrlImagen || img.url || img)
      );
    }

    return [];
  }

  verificarSiEsFavorito(): void {
    const token = localStorage.getItem('token');

    if (!token || !this.producto) {
      this.esFavorito = false;
      return;
    }

    const productoId = this.obtenerId(this.producto);

    if (!productoId) {
      this.esFavorito = false;
      return;
    }

    this.productoService.verificarFavorito(productoId).subscribe({
      next: (respuesta: any) => {
        this.esFavorito = Boolean(respuesta?.existe);
      },
      error: () => {
        this.esFavorito = false;
      }
    });
  }

  alternarFavorito(): void {
    const token = localStorage.getItem('token');

    if (!token) {
  this.accionPendiente = 'guardar productos en favoritos';
  this.mostrarModalLogin = true;
  return;
}

    if (!this.producto) {
      this.mostrarMensajeError('No se encontró el producto seleccionado.');
      return;
    }

    const productoId = this.obtenerId(this.producto);

    if (!productoId) {
      this.mostrarMensajeError('No se encontró el ID del producto.');
      return;
    }

    this.cargandoFavorito = true;

    if (this.esFavorito) {
      this.productoService.eliminarFavoritoPorProducto(productoId).subscribe({
        next: () => {
          this.cargandoFavorito = false;
          this.esFavorito = false;
          this.mostrarMensaje('Producto eliminado de favoritos.');
        },
        error: (error: any) => {
          this.cargandoFavorito = false;
          this.mostrarMensajeError(error.error?.mensaje || 'No se pudo eliminar de favoritos.');
        }
      });

      return;
    }

    this.productoService.agregarFavorito(productoId).subscribe({
      next: () => {
        this.cargandoFavorito = false;
        this.esFavorito = true;
        this.mostrarMensaje('Producto agregado a favoritos.');
      },
      error: (error: any) => {
        this.cargandoFavorito = false;

        if (error.status === 409) {
          this.esFavorito = true;
          this.mostrarMensaje('Este producto ya estaba en favoritos.');
          return;
        }

        this.mostrarMensajeError(error.error?.mensaje || 'No se pudo agregar a favoritos.');
      }
    });
  }

  cargarProductosRelacionados(): void {
    if (!this.producto) {
      this.productosRelacionados = [];
      return;
    }

    this.productoService.obtenerProductos().subscribe({
      next: (respuesta: any) => {
        const productos = Array.isArray(respuesta)
          ? respuesta
          : respuesta.data || [];

        const categoriaActual = this.obtenerCategoriaId(this.producto);
        const idActual = this.obtenerId(this.producto);

        let relacionados = productos.filter((producto: any) => {
          const mismaCategoria = this.obtenerCategoriaId(producto) === categoriaActual;
          const diferenteProducto = this.obtenerId(producto) !== idActual;
          const activo = this.obtenerEstado(producto);

          return mismaCategoria && diferenteProducto && activo;
        });

        if (relacionados.length === 0) {
          relacionados = productos.filter((producto: any) => {
            const diferenteProducto = this.obtenerId(producto) !== idActual;
            const activo = this.obtenerEstado(producto);

            return diferenteProducto && activo;
          });
        }

        this.productosRelacionados = relacionados.slice(0, 4);
      },
      error: () => {
        this.productosRelacionados = [];
      }
    });
  }

  cambiarImagen(imagen: string): void {
    this.imagenPrincipal = imagen;
  }

  aumentarCantidad(): void {
    const stock = this.obtenerStock(this.producto);

    if (this.cantidad < stock) {
      this.cantidad++;
    } else {
      this.mostrarMensajeError('Has alcanzado el límite de stock disponible.');
    }
  }

  disminuirCantidad(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  agregarAlCarrito(): void {
    const token = localStorage.getItem('token');

    if (!token) {
  this.accionPendiente = 'agregar productos al carrito';
  this.mostrarModalLogin = true;
  return;
}

    if (!this.producto) {
      this.mostrarMensajeError('No se encontró el producto seleccionado.');
      return;
    }

    const productoId = this.obtenerId(this.producto);

    if (!productoId) {
      this.mostrarMensajeError('No se encontró el ID del producto.');
      return;
    }

    if (this.obtenerStock(this.producto) <= 0) {
      this.mostrarMensajeError('Este producto no tiene stock disponible.');
      return;
    }

    this.productoService.agregarAlCarrito(productoId, this.cantidad).subscribe({
      next: () => {
        this.mostrarMensaje(`Producto agregado al carrito: ${this.obtenerNombre(this.producto)} x${this.cantidad}`);
      },
      error: (error: any) => {
        this.mostrarMensajeError(error.error?.mensaje || 'No se pudo agregar el producto al carrito.');
      }
    });
  }

  compartirProducto(): void {
    navigator.clipboard?.writeText(window.location.href);
    this.mostrarMensaje('Enlace del producto copiado.');
  }

  cerrarModalLogin(): void {
    this.mostrarModalLogin = false;
  }

  irALogin(): void {
    this.mostrarModalLogin = false;

    if (this.cambiarVista) {
      this.cambiarVista('login');
    }
  }

  volverAProductos(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    if (this.cambiarVista) {
      this.cambiarVista('lista');
    }
  }

  verDetalleRelacionado(producto: any): void {
    this.productoSeleccionado = { ...producto };
    this.cargarDetalleProducto();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  mostrarMensaje(texto: string): void {
    this.mensaje = texto;
    this.mensajeError = '';

    setTimeout(() => {
      this.mensaje = '';
    }, 2500);
  }

  mostrarMensajeError(texto: string): void {
    this.mensajeError = texto;
    this.mensaje = '';

    setTimeout(() => {
      this.mensajeError = '';
    }, 3000);
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

  obtenerNombre(producto: any): string {
    return producto?.Nombre || producto?.nombre || 'Producto sin nombre';
  }

  obtenerPrecio(producto: any): number {
    return Number(producto?.Precio ?? producto?.precio ?? 0);
  }

  obtenerDescripcion(producto: any): string {
    return producto?.Descripcion || producto?.descripcion || 'Sin descripción disponible.';
  }

  obtenerStock(producto: any): number {
    return Number(producto?.Stock ?? producto?.stock ?? 0);
  }

  obtenerCategoria(producto: any): string {
    return producto?.Categoria || producto?.categoria || producto?.NombreCategoria || producto?.nombreCategoria || 'Sin categoría';
  }

  obtenerCategoriaId(producto: any): string {
    return String(
      producto?.CategoriaID ??
      producto?.categoriaID ??
      producto?.CategoriaId ??
      producto?.categoriaId ??
      ''
    );
  }

  obtenerMarca(producto: any): string {
    return producto?.Marca || producto?.marca || producto?.NombreMarca || producto?.nombreMarca || 'Sin marca';
  }

  obtenerEstado(producto: any): boolean {
    if (producto?.Estado !== undefined) {
      return Boolean(producto.Estado);
    }

    if (producto?.estado !== undefined) {
      return Boolean(producto.estado);
    }

    return true;
  }

  obtenerImagen(producto: any): string {
    const imagen =
      producto?.Imagen ||
      producto?.imagen ||
      producto?.UrlImagen ||
      producto?.urlImagen ||
      '';

    return this.normalizarImagen(imagen);
  }

  normalizarImagen(imagen: string): string {
    if (!imagen) {
      return 'assets/img/EasyCommerce.png';
    }

    if (imagen.startsWith('http')) {
      return imagen;
    }

    if (imagen.startsWith('data:image')) {
      return imagen;
    }

    if (imagen.startsWith('assets/')) {
      return imagen;
    }

    if (imagen.startsWith('/')) {
      return `http://localhost:3000${imagen}`;
    }

    return imagen;
  }
}