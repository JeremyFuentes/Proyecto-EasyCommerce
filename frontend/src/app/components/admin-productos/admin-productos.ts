import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-productos.html',
  styleUrl: './admin-productos.css'
})
export class AdminProductosComponent implements OnInit {
  @Input() cambiarVista!: (vista: string) => void;
  @Input() cerrarSesion!: () => void;
  @Input() editarProducto!: (producto: any) => void;
  @Input() crearProducto!: () => void;
  @Input() vistaActual = '';

  productos: any[] = [];
  productosFiltrados: any[] = [];
  productosPaginados: any[] = [];

  categorias: string[] = [];
  marcas: string[] = [];

  buscarProducto = '';
  filtroCategoria = '';
  filtroMarca = '';
  filtroEstado = '';
  filtroPrecio = 2000;

  paginaActual = 1;
  productosPorPagina = 8;
  totalPaginas = 1;

  mensaje = '';

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (respuesta: any) => {
        this.productos = Array.isArray(respuesta)
          ? respuesta
          : respuesta.data || [];

        this.cargarFiltrosDesdeProductos();
        this.aplicarFiltros(false);
      },
      error: () => {
        this.mensaje = 'No se pudieron cargar los productos.';
      }
    });
  }

  nuevoProducto(): void {
  if (this.crearProducto) {
    this.crearProducto();
    return;
  }

  if (this.cambiarVista) {
    this.cambiarVista('admin-crear-producto');
  }
}

esStockBajo(producto: any): boolean {
  const stock = this.obtenerStock(producto);
  return stock > 0 && stock < 10;
}

esSinStock(producto: any): boolean {
  const stock = this.obtenerStock(producto);
  return stock <= 0;
}

obtenerClaseStock(producto: any): string {
  const stock = this.obtenerStock(producto);

  if (stock <= 0) {
    return 'stock-sin';
  }

  if (stock < 10) {
    return 'stock-bajo';
  }

  return 'stock-normal';
}

obtenerTextoStock(producto: any): string {
  const stock = this.obtenerStock(producto);

  if (stock <= 0) {
    return 'Sin stock';
  }

  if (stock < 10) {
    return 'Stock bajo';
  }

  return 'Stock normal';
}

  cargarFiltrosDesdeProductos(): void {
    this.categorias = [...new Set(
      this.productos
        .map(producto => this.obtenerCategoria(producto))
        .filter(valor => valor)
    )];

    this.marcas = [...new Set(
      this.productos
        .map(producto => this.obtenerMarca(producto))
        .filter(valor => valor)
    )];
  }

  aplicarFiltros(resetearPagina: boolean = true): void {
    const texto = this.buscarProducto.trim().toLowerCase();

    this.productosFiltrados = this.productos.filter(producto => {
      const nombre = this.obtenerNombre(producto).toLowerCase();
      const sku = this.obtenerSku(producto).toLowerCase();
      const categoria = this.obtenerCategoria(producto);
      const marca = this.obtenerMarca(producto);
      const estado = this.obtenerEstado(producto);
      const precio = this.obtenerPrecio(producto);

      const coincideTexto =
        !texto ||
        nombre.includes(texto) ||
        sku.includes(texto);

      const coincideCategoria =
        !this.filtroCategoria ||
        categoria === this.filtroCategoria;

      const coincideMarca =
        !this.filtroMarca ||
        marca === this.filtroMarca;

      const coincideEstado =
        this.filtroEstado === '' ||
        String(estado) === this.filtroEstado;

      const coincidePrecio = precio <= Number(this.filtroPrecio);

      return coincideTexto && coincideCategoria && coincideMarca && coincideEstado && coincidePrecio;
    });

    if (resetearPagina) {
      this.paginaActual = 1;
    }

    this.actualizarPaginacion();
  }

  eliminarFiltros(): void {
    this.buscarProducto = '';
    this.filtroCategoria = '';
    this.filtroMarca = '';
    this.filtroEstado = '';
    this.filtroPrecio = 2000;
    this.paginaActual = 1;

    this.aplicarFiltros();
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.ceil(this.productosFiltrados.length / this.productosPorPagina) || 1;

    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    const fin = inicio + this.productosPorPagina;

    this.productosPaginados = this.productosFiltrados.slice(inicio, fin);
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;

    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }

  obtenerPaginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, index) => index + 1);
  }

  irA(vista: string, event?: Event): void {
    if (event) event.preventDefault();

    if (this.cambiarVista) {
      this.cambiarVista(vista);
    }
  }

  logout(event: Event): void {
    event.preventDefault();

    if (this.cerrarSesion) {
      this.cerrarSesion();
    }
  }

  editar(producto: any): void {
    if (this.editarProducto) {
      this.editarProducto(producto);
    }
  }

  eliminarProducto(producto: any): void {
    const confirmar = confirm(`¿Deseas desactivar el producto "${this.obtenerNombre(producto)}"?`);

    if (!confirmar) return;

    const id = this.obtenerId(producto);

    this.productoService.eliminarProducto(id).subscribe({
      next: () => {
        this.mensaje = 'Producto desactivado correctamente.';
        this.cargarProductos();
      },
      error: (error: any) => {
        this.mensaje = error.error?.mensaje || 'No se pudo desactivar el producto.';
      }
    });
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

  obtenerStock(producto: any): number {
    return Number(producto?.Stock ?? producto?.stock ?? 0);
  }

  obtenerCategoria(producto: any): string {
    return producto?.Categoria || producto?.categoria || producto?.NombreCategoria || producto?.nombreCategoria || '';
  }

  obtenerMarca(producto: any): string {
    return producto?.Marca || producto?.marca || producto?.NombreMarca || producto?.nombreMarca || '';
  }

  obtenerProveedor(producto: any): string {
    return producto?.Proveedor || producto?.proveedor || producto?.NombreProveedor || producto?.nombreProveedor || '';
  }

  obtenerSku(producto: any): string {
    return producto?.SKU || producto?.sku || 'N/A';
  }

  obtenerDescripcion(producto: any): string {
    return producto?.Descripcion || producto?.descripcion || 'Sin descripción';
  }

  obtenerEstado(producto: any): boolean {
    if (producto?.Estado !== undefined) return Boolean(producto.Estado);
    if (producto?.estado !== undefined) return Boolean(producto.estado);
    return true;
  }

  obtenerImagen(producto: any): string {
    const imagen =
      producto?.Imagen ||
      producto?.imagen ||
      producto?.UrlImagen ||
      producto?.urlImagen ||
      '';

    if (!imagen) return 'assets/img/EasyCommerce.png';
    if (imagen.startsWith('http')) return imagen;
    if (imagen.startsWith('data:image')) return imagen;
    if (imagen.startsWith('assets/')) return imagen;
    if (imagen.startsWith('/')) return `http://localhost:3000${imagen}`;

    return imagen;
  }
}