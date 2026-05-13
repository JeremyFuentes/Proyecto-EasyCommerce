import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { Subscription } from 'rxjs';
import { BusquedaService } from '../../../services/busqueda.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-productos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-lista.html',
  styleUrl: './productos-lista.css'
})
export class ProductosListaComponent implements OnInit, OnDestroy {

  productos: any[] = [];
  productosFiltrados: any[] = [];
  productosPaginados: any[] = [];

  categorias: any[] = [];
  marcas: any[] = [];

  categoriasDisponibles: any[] = [];
  marcasDisponibles: any[] = [];

  filtroCategoria = '';
  filtroMarca = '';
  filtroPrecio = 2000;
  busqueda = '';

  paginaActual = 1;
  productosPorPagina = 9;
  totalPaginas = 1;

  cargando = false;
  mensajeError = '';
  mensaje = '';

  favoritosIds = new Set<string>();
  cargandoFavoritoId: string | null = null;

  private busquedaSubscription?: Subscription;
  private filtrosSubscription?: Subscription;

  constructor(
    private productoService: ProductoService,
    private busquedaService: BusquedaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarFiltros();
    this.cargarFavoritos();
    this.cargarProductos();

    this.busqueda = this.busquedaService.obtenerBusquedaActual();

    this.busquedaSubscription = this.busquedaService.terminoBusqueda$.subscribe(termino => {
      this.busqueda = termino;
      this.aplicarFiltros();
    });

    this.filtrosSubscription = this.busquedaService.filtrosProducto$.subscribe(filtros => {
      if (filtros.busqueda !== undefined) {
        this.busqueda = filtros.busqueda || '';
        this.filtroCategoria = '';
        this.filtroMarca = '';
      }

      if (filtros.categoriaId !== undefined) {
        this.filtroCategoria = filtros.categoriaId || '';
        this.filtroMarca = '';
        this.busqueda = '';
      }

      if (filtros.marcaId !== undefined) {
        this.filtroMarca = filtros.marcaId || '';
        this.filtroCategoria = '';
        this.busqueda = '';
      }

      this.aplicarFiltros();
    });
  }

  ngOnDestroy(): void {
    this.busquedaSubscription?.unsubscribe();
    this.filtrosSubscription?.unsubscribe();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.productoService.obtenerProductos().subscribe({
      next: (respuesta: any) => {
        this.cargando = false;

        this.productos = Array.isArray(respuesta)
          ? respuesta
          : respuesta.data || [];

        this.productos = this.productos.filter(producto => this.obtenerEstado(producto));

        const filtrosActuales = this.busquedaService.obtenerFiltrosActuales();

        if (filtrosActuales.categoriaId) {
          this.filtroCategoria = filtrosActuales.categoriaId;
          this.filtroMarca = '';
        }

        if (filtrosActuales.marcaId) {
          this.filtroMarca = filtrosActuales.marcaId;
          this.filtroCategoria = '';
        }

        if (filtrosActuales.busqueda) {
          this.busqueda = filtrosActuales.busqueda;
        }

        this.aplicarFiltros(false);
      },
      error: () => {
        this.cargando = false;
        this.mensajeError = 'No se pudieron cargar los productos.';
      }
    });
  }

  cargarFavoritos(): void {
    const usuarioId = localStorage.getItem('usuarioId');
    const token = localStorage.getItem('token');

    if (!usuarioId || !token) {
      this.favoritosIds.clear();
      return;
    }

    this.productoService.obtenerFavoritosUsuario(usuarioId).subscribe({
      next: (respuesta: any) => {
        const datos = Array.isArray(respuesta)
          ? respuesta
          : respuesta.data || [];

        this.favoritosIds.clear();

        datos.forEach((item: any) => {
          const producto = item.Producto || item.producto || {};

          const productoId = String(
            producto.ProductoID ||
            producto.productoId ||
            item.ProductoID ||
            item.productoId ||
            ''
          );

          if (productoId) {
            this.favoritosIds.add(productoId);
          }
        });
      },
      error: () => {
        this.favoritosIds.clear();
      }
    });
  }

  cargarFiltros(): void {
    this.productoService.obtenerCategorias().subscribe({
      next: (respuesta: any) => {
        this.categorias = Array.isArray(respuesta)
          ? respuesta
          : respuesta.data || [];

        this.categoriasDisponibles = [...this.categorias];
      },
      error: () => {
        this.categorias = [];
        this.categoriasDisponibles = [];
      }
    });

    this.productoService.obtenerMarcas().subscribe({
      next: (respuesta: any) => {
        this.marcas = Array.isArray(respuesta)
          ? respuesta
          : respuesta.data || [];

        this.marcasDisponibles = [...this.marcas];
      },
      error: () => {
        this.marcas = [];
        this.marcasDisponibles = [];
      }
    });
  }

  actualizarFiltrosDisponibles(): void {
    let productosBase = [...this.productos];

    const textoBusqueda = this.busqueda.trim().toLowerCase();

    if (textoBusqueda) {
      productosBase = productosBase.filter(producto => {
        const nombre = this.obtenerNombre(producto).toLowerCase();
        const descripcion = this.obtenerDescripcion(producto).toLowerCase();

        return nombre.includes(textoBusqueda) || descripcion.includes(textoBusqueda);
      });
    }

    if (this.filtroCategoria) {
      const productosDeCategoria = productosBase.filter(producto =>
        this.obtenerCategoriaId(producto) === String(this.filtroCategoria)
      );

      const marcasIds = new Set(
        productosDeCategoria.map(producto => this.obtenerMarcaId(producto))
      );

      this.marcasDisponibles = this.marcas.filter(marca =>
        marcasIds.has(this.obtenerMarcaValor(marca))
      );
    } else {
      this.marcasDisponibles = [...this.marcas];
    }

    if (this.filtroMarca) {
      const productosDeMarca = productosBase.filter(producto =>
        this.obtenerMarcaId(producto) === String(this.filtroMarca)
      );

      const categoriasIds = new Set(
        productosDeMarca.map(producto => this.obtenerCategoriaId(producto))
      );

      this.categoriasDisponibles = this.categorias.filter(categoria =>
        categoriasIds.has(this.obtenerCategoriaValor(categoria))
      );
    } else {
      this.categoriasDisponibles = [...this.categorias];
    }

    const categoriaExiste = this.categoriasDisponibles.some(categoria =>
      this.obtenerCategoriaValor(categoria) === String(this.filtroCategoria)
    );

    const marcaExiste = this.marcasDisponibles.some(marca =>
      this.obtenerMarcaValor(marca) === String(this.filtroMarca)
    );

    if (this.filtroCategoria && !categoriaExiste) {
      this.filtroCategoria = '';
    }

    if (this.filtroMarca && !marcaExiste) {
      this.filtroMarca = '';
    }
  }

  aplicarFiltros(resetearPagina: boolean = true): void {
    this.actualizarFiltrosDisponibles();

    const textoBusqueda = this.busqueda.trim().toLowerCase();

    this.productosFiltrados = this.productos.filter(producto => {
      const nombre = this.obtenerNombre(producto).toLowerCase();
      const descripcion = this.obtenerDescripcion(producto).toLowerCase();
      const categoriaId = this.obtenerCategoriaId(producto);
      const categoriaNombreProducto = this.obtenerCategoriaProducto(producto);
      const marcaId = this.obtenerMarcaId(producto);
      const precio = this.obtenerPrecio(producto);

      const coincideBusqueda =
        !textoBusqueda ||
        nombre.includes(textoBusqueda) ||
        descripcion.includes(textoBusqueda);

      const categoriaSeleccionada = this.categorias.find(c =>
        this.obtenerCategoriaValor(c) === String(this.filtroCategoria)
      );

      const nombreCategoriaSeleccionada = categoriaSeleccionada
        ? this.obtenerCategoriaNombre(categoriaSeleccionada).toLowerCase()
        : '';

      const coincideCategoria =
        !this.filtroCategoria ||
        String(categoriaId) === String(this.filtroCategoria) ||
        categoriaNombreProducto === nombreCategoriaSeleccionada;

      const coincideMarca =
        !this.filtroMarca ||
        String(marcaId) === String(this.filtroMarca);

      const coincidePrecio = precio <= Number(this.filtroPrecio);

      return coincideBusqueda && coincideCategoria && coincideMarca && coincidePrecio;
    });

    if (resetearPagina) {
      this.paginaActual = 1;
    }

    this.actualizarPaginacion();
  }

  eliminarFiltros(): void {
    this.filtroCategoria = '';
    this.filtroMarca = '';
    this.filtroPrecio = 2000;
    this.busqueda = '';
    this.paginaActual = 1;

    this.busquedaService.limpiarBusqueda();

    this.categoriasDisponibles = [...this.categorias];
    this.marcasDisponibles = [...this.marcas];

    this.aplicarFiltros();
  }

  alCambiarCategoria(): void {
    this.actualizarFiltrosDisponibles();
  }

  alCambiarMarca(): void {
    this.actualizarFiltrosDisponibles();
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.ceil(this.productosFiltrados.length / this.productosPorPagina) || 1;

    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = this.totalPaginas;
    }

    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    const fin = inicio + this.productosPorPagina;

    this.productosPaginados = this.productosFiltrados.slice(inicio, fin);
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) {
      return;
    }

    this.paginaActual = pagina;
    this.actualizarPaginacion();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  obtenerPaginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, index) => index + 1);
  }

  abrirDetalle(producto: any): void {
    const productoId = this.obtenerIdProducto(producto);

    if (!productoId) {
      this.mensajeError = 'No se pudo abrir el detalle del producto.';
      return;
    }

    this.router.navigate(['/productos', productoId]);
  }

  obtenerIdProducto(producto: any): string {
    return String(
      producto.ProductoID ??
      producto.productoID ??
      producto.ProductoId ??
      producto.productoId ??
      producto.id ??
      producto._id ??
      ''
    );
  }

  agregarAlCarrito(producto: any): void {
    const token = localStorage.getItem('token');

    if (!this.estaLogueado()) {
      this.accionPendiente = 'agregar productos al carrito';
      this.mostrarModalLogin = true;
      return;
    }

    const productoId = this.obtenerId(producto);

    if (!productoId) {
      this.mensajeError = 'No se encontró el ID del producto.';
      return;
    }

    this.productoService.agregarAlCarrito(productoId, 1).subscribe({
      next: () => {
        this.mensaje = 'Producto agregado al carrito.';

        setTimeout(() => {
          this.mensaje = '';
        }, 2500);
      },
      error: (error: any) => {
        this.mensajeError = error.error?.mensaje || 'No se pudo agregar el producto al carrito.';

        setTimeout(() => {
          this.mensajeError = '';
        }, 3000);
      }
    });
  }

  agregarAFavoritos(producto: any): void {
    const token = localStorage.getItem('token');

    if (!this.estaLogueado()) {
      this.accionPendiente = 'agregar productos a favoritos';
      this.mostrarModalLogin = true;
      return;
    }

    const productoId = this.obtenerId(producto);

    if (!productoId) {
      this.mensajeError = 'No se encontró el ID del producto.';
      return;
    }

    this.cargandoFavoritoId = productoId;

    if (this.esProductoFavorito(producto)) {
      this.productoService.eliminarFavoritoPorProducto(productoId).subscribe({
        next: () => {
          this.cargandoFavoritoId = null;
          this.favoritosIds.delete(productoId);

          this.mensaje = 'Producto eliminado de favoritos.';

          setTimeout(() => {
            this.mensaje = '';
          }, 2500);
        },
        error: (error: any) => {
          this.cargandoFavoritoId = null;
          this.mensajeError = error.error?.mensaje || 'No se pudo eliminar de favoritos.';

          setTimeout(() => {
            this.mensajeError = '';
          }, 3000);
        }
      });

      return;
    }

    this.productoService.agregarFavorito(productoId).subscribe({
      next: () => {
        this.cargandoFavoritoId = null;
        this.favoritosIds.add(productoId);

        this.mensaje = 'Producto agregado a favoritos.';

        setTimeout(() => {
          this.mensaje = '';
        }, 2500);
      },
      error: (error: any) => {
        this.cargandoFavoritoId = null;

        if (error.status === 409) {
          this.favoritosIds.add(productoId);
          this.mensaje = 'Este producto ya estaba en favoritos.';

          setTimeout(() => {
            this.mensaje = '';
          }, 2500);

          return;
        }

        this.mensajeError = error.error?.mensaje || 'No se pudo agregar a favoritos.';

        setTimeout(() => {
          this.mensajeError = '';
        }, 3000);
      }
    });
  }

  estaLogueado(): boolean {
    return !!localStorage.getItem('token') && localStorage.getItem('tipoLogin') === 'usuario';
  }

  esProductoFavorito(producto: any): boolean {
    const productoId = this.obtenerId(producto);
    return this.favoritosIds.has(productoId);
  }

  estaCargandoFavorito(producto: any): boolean {
    const productoId = this.obtenerId(producto);
    return this.cargandoFavoritoId === productoId;
  }

  obtenerId(producto: any): string {
    return String(
      producto?.ProductoID ||
      producto?.productoId ||
      producto?.ProductoId ||
      producto?._id ||
      producto?.id ||
      ''
    );
  }

  obtenerNombre(producto: any): string {
    return producto?.Nombre || producto?.nombre || 'Producto sin nombre';
  }

  obtenerPrecio(producto: any): number {
    return Number(producto?.Precio || producto?.precio || 0);
  }

  obtenerStock(producto: any): number {
    return Number(producto?.Stock || producto?.stock || 0);
  }

  obtenerDescripcion(producto: any): string {
    return producto?.Descripcion || producto?.descripcion || '';
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

  obtenerMarcaId(producto: any): string {
    return String(
      producto?.MarcaID ||
      producto?.marcaId ||
      producto?.MarcaId ||
      ''
    );
  }

  obtenerCategoriaNombre(categoria: any): string {
    return categoria?.Nombre || categoria?.nombre || categoria?.Categoria || categoria?.categoria || '';
  }

  obtenerCategoriaValor(categoria: any): string {
    return String(
      categoria?.CategoriaID ??
      categoria?.categoriaID ??
      categoria?.CategoriaId ??
      categoria?.categoriaId ??
      categoria?.id ??
      ''
    );
  }

  obtenerCategoriaProducto(producto: any): string {
    return String(
      producto?.Categoria ||
      producto?.categoria ||
      producto?.NombreCategoria ||
      producto?.nombreCategoria ||
      ''
    ).toLowerCase();
  }

  obtenerMarcaNombre(marca: any): string {
    return marca?.Nombre || marca?.nombre || '';
  }

  obtenerMarcaValor(marca: any): string {
    return String(marca?.MarcaID || marca?.marcaId || marca?.id || '');
  }

  obtenerImagen(producto: any): string {
    const imagen = producto?.Imagen || producto?.imagen || '';

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
      return `https://easycommerce.onrender.com${imagen}`;
    }

    return imagen;
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

  mostrarModalLogin = false;
  accionPendiente = '';


  solicitarLogin(accion: string): void {
    this.accionPendiente = accion;
    this.mostrarModalLogin = true;
  }

  cerrarModalLogin(): void {
    this.mostrarModalLogin = false;
  }

  irALogin(): void {
    this.cerrarModalLogin();
    this.router.navigate(['/login']);
  }

  irADashboard(): void {
    this.router.navigate(['/dashboard']);
  }

}