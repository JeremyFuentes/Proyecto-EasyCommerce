import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../services/producto.service';
import { BusquedaService } from '../../../services/busqueda.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  @Input() cambiarVista!: (vista: string) => void;
  @Input() verDetalleProducto!: (producto: any) => void;

  laptopsNuevas: any[] = [];
  productosAsus: any[] = [];
  mensajeError = '';

  private categoriaLaptopId = '1';
  private marcaAsusId = '1';

  constructor(
    private productoService: ProductoService,
    private busquedaService: BusquedaService
  ) { }

  ngOnInit(): void {
    this.cargarProductosInicio();
  }

  cargarProductosInicio(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (respuesta: any) => {
        const productos = Array.isArray(respuesta)
          ? respuesta
          : respuesta.data || [];

        const productosActivos = productos.filter((producto: any) => this.obtenerEstado(producto));

        this.laptopsNuevas = productosActivos
          .filter((producto: any) => {
            const categoriaId = this.obtenerCategoriaId(producto);
            const categoria = this.obtenerCategoria(producto).toLowerCase();

            return categoriaId === this.categoriaLaptopId || categoria.includes('laptop');
          })
          .slice(0, 4);

        this.productosAsus = productosActivos
          .filter((producto: any) => {
            const marcaId = this.obtenerMarcaId(producto);
            const marca = this.obtenerMarca(producto).toLowerCase();
            const nombre = this.obtenerNombre(producto).toLowerCase();

            return marcaId === this.marcaAsusId || marca.includes('asus') || nombre.includes('asus');
          })
          .slice(0, 4);

        if (this.laptopsNuevas.length === 0) {
          this.laptopsNuevas = productosActivos.slice(0, 4);
        }

        if (this.productosAsus.length === 0) {
          this.productosAsus = productosActivos.slice(0, 4);
        }
      },
      error: () => {
        this.mensajeError = 'No se pudieron cargar los productos desde el backend.';
      }
    });
  }

  verProductos(): void {
    this.busquedaService.limpiarBusqueda();

    if (this.cambiarVista) {
      this.cambiarVista('lista');
    }
  }

  verDetalle(producto: any): void {
    if (this.verDetalleProducto) {
      this.verDetalleProducto(producto);
    }
  }

  verTodosLaptops(): void {
    this.busquedaService.establecerFiltroCategoria(this.categoriaLaptopId);

    if (this.cambiarVista) {
      this.cambiarVista('lista');
    }
  }

  verTodosAsus(): void {
    this.busquedaService.establecerFiltroMarca(this.marcaAsusId);

    if (this.cambiarVista) {
      this.cambiarVista('lista');
    }
  }

  obtenerNombre(producto: any): string {
    return producto.nombre || producto.Nombre || 'Producto sin nombre';
  }

  obtenerDescripcion(producto: any): string {
    return producto.descripcion || producto.Descripcion || 'Producto tecnológico disponible.';
  }

  obtenerPrecio(producto: any): number {
    return Number(producto.precio || producto.Precio || 0);
  }

  obtenerImagen(producto: any): string {
    const imagen = producto.imagen || producto.Imagen || '';

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

  obtenerCategoria(producto: any): string {
    return producto.Categoria || producto.categoria || producto.NombreCategoria || producto.nombreCategoria || '';
  }

  obtenerCategoriaId(producto: any): string {
    return String(
      producto.CategoriaID ??
      producto.categoriaID ??
      producto.CategoriaId ??
      producto.categoriaId ??
      ''
    );
  }

  obtenerMarca(producto: any): string {
    return producto.Marca || producto.marca || producto.NombreMarca || producto.nombreMarca || '';
  }

  obtenerMarcaId(producto: any): string {
    return String(
      producto.MarcaID ??
      producto.marcaID ??
      producto.MarcaId ??
      producto.marcaId ??
      ''
    );
  }

  obtenerEstado(producto: any): boolean {
    if (producto.Estado !== undefined) {
      return Boolean(producto.Estado);
    }

    if (producto.estado !== undefined) {
      return Boolean(producto.estado);
    }

    return true;
  }
}