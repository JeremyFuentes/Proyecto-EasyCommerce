import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';

@Component({
  selector: 'app-producto-crear',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './producto-crear.html',
  styleUrl: './producto-crear.css'
})
export class ProductoCrearComponent {
  producto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    categoriaId: '',
    marcaId: '',
    proveedorId: '',
    imagen: ''
  };

  mensaje = '';

  constructor(private productoService: ProductoService) {}

  guardarProducto(): void {
    const stockNumero = Number(this.producto.stock);

    if (
      !this.producto.nombre ||
      Number(this.producto.precio) <= 0 ||
      stockNumero < 0 ||
      !Number.isInteger(stockNumero)
    ) {
      this.mensaje = 'Verifique los campos. El stock debe ser un número entero.';
      return;
    }

    this.productoService.crearProducto(this.producto).subscribe({
      next: () => {
        this.mensaje = 'Producto creado correctamente';

        this.producto = {
          nombre: '',
          descripcion: '',
          precio: 0,
          stock: 0,
          categoriaId: '',
          marcaId: '',
          proveedorId: '',
          imagen: ''
        };
      },
      error: () => {
        this.mensaje = 'Error al crear producto';
      }
    });
  }
}