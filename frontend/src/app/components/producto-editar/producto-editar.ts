import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { Producto } from '../../../models/producto.model';

@Component({
  selector: 'app-producto-editar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './producto-editar.html',
  styleUrl: './producto-editar.css'
})
export class ProductoEditarComponent implements OnChanges {
  @Input() productoSeleccionado: Producto | null = null;
  @Input() volverALista!: () => void;

  producto: Producto = {
    id: 0,
    nombre: '',
    precio: 0,
    stock: 0
  };

  mensaje = '';

  constructor(private productoService: ProductoService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productoSeleccionado'] && this.productoSeleccionado) {
      this.producto = { ...this.productoSeleccionado };
    }
  }

  actualizarProducto(): void {
  if (
    !this.producto.nombre ||
    this.producto.precio <= 0 ||
    this.producto.stock < 0 ||
    !Number.isInteger(this.producto.stock)
  ) {
    this.mensaje = 'Complete correctamente todos los campos. El stock debe ser un número entero.';
    return;
  }

  this.productoService.actualizarProducto(this.producto);
  this.mensaje = 'Producto actualizado correctamente.';
}
}