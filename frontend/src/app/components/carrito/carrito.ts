import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { MetodoPagoService } from '../../../services/metodo-pago.service';

interface ItemCarrito {
  id: number | string;
  carritoId: number | string;
  productoId: number | string;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  imagen: string;
  estadoProductoId: number;
  estadoProducto: string;
}

interface MetodoPago {
  _id?: string;
  MetodoPagoID?: number;
  TipoTarjeta: string;
  Titular: string;
  UltimosDigitos: string;
  Expiracion: string;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class CarritoComponent implements OnInit {
  codigoDescuento = '';
  descuento = 0;
  envio = 5;

  mostrarModalCompra = false;
  mostrarModalContacto = false;
  mostrarFormularioTarjeta = false;

  metodoPago = 'contraentrega';

  direccionUsuario = 'Chalatenango, El Salvador';
  camposFaltantes: string[] = [];

  carrito: ItemCarrito[] = [];

  cargando = false;
  mensaje = '';
  mensajeError = '';

  constructor(
    private productoService: ProductoService,
    private metodoPagoService: MetodoPagoService
  ) { }

  metodosPago: MetodoPago[] = [];
  metodoPagoSeleccionado = '';
  opcionTarjeta: 'guardada' | 'nueva' = 'guardada';

  nuevaTarjeta = {
    TipoTarjeta: 'Crédito',
    Titular: '',
    NumeroTarjeta: '',
    Expiracion: ''
  };

  ngOnInit(): void {
    this.cargarCarrito();
  }

  cargarCarrito(): void {
    const usuarioId = localStorage.getItem('usuarioId');

    if (!usuarioId) {
      this.mensajeError = 'No se encontró el usuario en sesión.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    this.productoService.obtenerCarritoPendiente(usuarioId).subscribe({
      next: (respuesta: any) => {
        this.cargando = false;

        const datos = Array.isArray(respuesta)
          ? respuesta
          : respuesta.data || [];

        this.carrito = datos.map((item: any) => this.mapearItemCarrito(item));
      },
      error: (error: any) => {
        this.cargando = false;
        this.mensajeError = error.error?.mensaje || 'No se pudo cargar el carrito.';
      }
    });
  }

  mapearItemCarrito(item: any): ItemCarrito {
    return {
      id: item.CarritoID || item.carritoId || item._id,
      carritoId: item.CarritoID || item.carritoId || item._id,
      productoId: item.ProductoID || item.productoId || '',
      nombre: item.NombreProducto || item.nombreProducto || item.nombre || 'Producto sin nombre',
      descripcion: item.Descripcion || item.descripcion || '',
      precio: Number(item.PrecioUnitario || item.precioUnitario || item.precio || 0),
      cantidad: Number(item.Cantidad || item.cantidad || 1),
      imagen: this.normalizarImagen(item.Imagen || item.imagen || ''),
      estadoProductoId: Number(item.EstadoProductoId || item.estadoProductoId || 1),
      estadoProducto: item.EstadoProducto || item.estadoProducto || 'Pendiente de Pago'
    };
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

  get subtotal(): number {
    return this.carrito.reduce((total, item) => {
      return total + item.precio * item.cantidad;
    }, 0);
  }

  get total(): number {
    const envioAplicado = this.carrito.length > 0 ? this.envio : 0;
    return Math.max(this.subtotal - this.descuento + envioAplicado, 0);
  }

  aumentarCantidad(item: ItemCarrito): void {
    item.cantidad++;
  }

  disminuirCantidad(item: ItemCarrito): void {
    if (item.cantidad > 1) {
      item.cantidad--;
    }
  }

  eliminarProducto(id: number | string): void {
    const confirmar = confirm('¿Seguro que deseas eliminar este producto del carrito?');

    if (!confirmar) return;

    this.carrito = this.carrito.filter(item => item.id !== id);
    this.calcularDescuentoActual();
  }

  aplicarCodigo(): void {
    const codigo = this.codigoDescuento.trim().toUpperCase();

    if (codigo === 'EASY10') {
      this.descuento = this.subtotal * 0.1;
      return;
    }

    if (codigo === 'EASY15') {
      this.descuento = this.subtotal * 0.15;
      return;
    }

    if (codigo === 'EASY20') {
      this.descuento = this.subtotal * 0.2;
      return;
    }

    if (codigo === 'ENVIO') {
      this.envio = 0;
      this.descuento = 0;
      return;
    }

    this.descuento = 0;
    this.envio = 5;
    alert('Código de descuento no válido.');
  }

  calcularDescuentoActual(): void {
    if (!this.codigoDescuento) {
      this.descuento = 0;
      return;
    }

    this.aplicarCodigo();
  }

  finalizarCompra(): void {
    this.camposFaltantes = [];

    if (!this.direccionUsuario || this.direccionUsuario.trim() === '') {
      this.camposFaltantes.push('Dirección');
    }

    if (this.camposFaltantes.length > 0) {
      this.mostrarModalContacto = true;
      return;
    }

    if (this.carrito.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }

    this.mostrarModalCompra = true;
    this.cargarMetodosPago();
  }

  cambiarMetodoPago(): void {
    this.mostrarFormularioTarjeta = this.metodoPago === 'tarjeta';

    if (this.metodoPago === 'tarjeta') {
      this.cargarMetodosPago();
    }
  }

  cargarMetodosPago(): void {
    const usuarioId = localStorage.getItem('usuarioId');

    if (!usuarioId) return;

    this.metodoPagoService.obtenerMetodosPago(usuarioId).subscribe({
      next: (respuesta: any) => {
        this.metodosPago = Array.isArray(respuesta)
          ? respuesta
          : respuesta.data || [];

        if (this.metodosPago.length > 0) {
          const primera = this.metodosPago[0];
          this.metodoPagoSeleccionado = String(primera.MetodoPagoID || primera._id || '');
          this.opcionTarjeta = 'guardada';
        } else {
          this.opcionTarjeta = 'nueva';
        }
      },
      error: () => {
        this.metodosPago = [];
        this.opcionTarjeta = 'nueva';
      }
    });
  }

  guardarNuevaTarjetaDesdeCarrito(): Promise<boolean> {
    return new Promise((resolve) => {
      const usuarioId = localStorage.getItem('usuarioId');

      if (!usuarioId) {
        alert('No se encontró el usuario en sesión.');
        resolve(false);
        return;
      }

      const numeroLimpio = this.nuevaTarjeta.NumeroTarjeta.replace(/\s/g, '');

      if (
        !this.nuevaTarjeta.TipoTarjeta ||
        !this.nuevaTarjeta.Titular.trim() ||
        !numeroLimpio ||
        !this.nuevaTarjeta.Expiracion.trim()
      ) {
        alert('Debe completar todos los datos de la tarjeta.');
        resolve(false);
        return;
      }

      if (numeroLimpio.length < 12) {
        alert('El número de tarjeta no parece válido.');
        resolve(false);
        return;
      }

      const data = {
        UsuarioID: usuarioId,
        TipoTarjeta: this.nuevaTarjeta.TipoTarjeta,
        Titular: this.nuevaTarjeta.Titular.trim(),
        NumeroTarjeta: numeroLimpio,
        Expiracion: this.nuevaTarjeta.Expiracion.trim()
      };

      this.metodoPagoService.agregarMetodoPago(data).subscribe({
        next: (respuesta: any) => {
          const metodoGuardado = respuesta.data || respuesta;

          this.metodosPago.push(metodoGuardado);
          this.metodoPagoSeleccionado = String(
            metodoGuardado.MetodoPagoID || metodoGuardado._id || ''
          );

          this.nuevaTarjeta = {
            TipoTarjeta: 'Crédito',
            Titular: '',
            NumeroTarjeta: '',
            Expiracion: ''
          };

          resolve(true);
        },
        error: (error: any) => {
          alert(error.error?.mensaje || 'No se pudo guardar la tarjeta.');
          resolve(false);
        }
      });
    });
  }

  async confirmarCompra(): Promise<void> {
    if (this.metodoPago === 'tarjeta') {
      if (this.opcionTarjeta === 'guardada' && !this.metodoPagoSeleccionado) {
        alert('Debe seleccionar una tarjeta guardada o agregar una nueva.');
        return;
      }

      if (this.opcionTarjeta === 'nueva') {
        const guardada = await this.guardarNuevaTarjetaDesdeCarrito();

        if (!guardada) {
          return;
        }
      }
    }

    const usuarioId = localStorage.getItem('usuarioId');

    if (!usuarioId) {
      alert('No se encontró el usuario en sesión.');
      return;
    }

    this.productoService.finalizarCompra(usuarioId, {
      Envio: this.envio,
      Descuento: this.descuento
    }).subscribe({
      next: () => {
        alert('Compra confirmada correctamente.');

        this.carrito = [];
        this.mostrarModalCompra = false;
        this.cargarCarrito();
      },
      error: (error: any) => {
        alert(error.error?.mensaje || 'No se pudo finalizar la compra.');
      }
    });
  }

  cerrarModalCompra(): void {
    this.mostrarModalCompra = false;
  }

  cerrarModalContacto(): void {
    this.mostrarModalContacto = false;
  }
}