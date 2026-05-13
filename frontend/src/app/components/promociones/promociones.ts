import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../services/producto.service';

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './promociones.html',
  styleUrl: './promociones.css'
})
export class PromocionesComponent implements OnInit {
  @Input() cambiarVista!: (vista: string) => void;

  promociones: any[] = [];
  mensajeError = '';

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarPromociones();
  }

  cargarPromociones(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (respuesta: any) => {
        const productos = Array.isArray(respuesta)
          ? respuesta
          : respuesta.data || [];

        this.promociones = productos.slice(0, 6).map((producto: any, index: number) => {
          const descuento = this.obtenerDescuento(index);
          const precio = this.obtenerPrecio(producto);
          const precioAnterior = precio / (1 - descuento / 100);

          return {
            ...producto,
            descuento,
            precioAnterior
          };
        });
      },
      error: () => {
        this.mensajeError = 'No se pudieron cargar las promociones desde el backend.';
      }
    });
  }

  obtenerDescuento(index: number): number {
    const descuentos = [10, 15, 20, 25, 30, 35];
    return descuentos[index % descuentos.length];
  }

  verProductos(): void {
    if (this.cambiarVista) {
      this.cambiarVista('lista');
    }
  }

  obtenerNombre(producto: any): string {
    return producto.nombre || producto.Nombre || 'Producto sin nombre';
  }

  obtenerDescripcion(producto: any): string {
    return producto.descripcion || producto.Descripcion || 'Producto tecnológico en promoción.';
  }

  obtenerPrecio(producto: any): number {
    return Number(producto.precio || producto.Precio || 0);
  }

  obtenerPrecioAnterior(producto: any): number {
    return Number(producto.precioAnterior || 0);
  }

  obtenerImagen(producto: any): string {
    return producto.imagen || producto.Imagen || 'assets/img/EasyCommerce.png';
  }
}