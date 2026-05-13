import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { ProductoService } from '../../../services/producto.service';
import { MetodoPagoService } from '../../../services/metodo-pago.service';

interface DetalleOrden {
  carritoId: string | number;
  productoId: string | number;
  nombre: string;
  imagen: string;
  cantidad: number;
  precioUnitario: number;
  totalLinea: number;
  estadoProductoId: number;
  estado: string;
}

interface OrdenUsuario {
  ordenId: string | number;
  fechaOrden: string | null;
  subtotal: number;
  envio: number;
  descuento: number;
  total: number;
  estadoGeneral: string;
  detalles: DetalleOrden[];
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
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css'
})
export class ConfiguracionComponent implements OnInit {
  seccionActiva: 'cuenta' | 'pedidos' | 'historial' | 'pagos' = 'cuenta';

  usuarioId = localStorage.getItem('usuarioId') || '';

  usuario = {
    nombre: '',
    correo: '',
    direccion: '',
    contacto: ''
  };

  passwordActual = '';
  nuevaPassword = '';
  confirmarPassword = '';
  mostrarCambioPassword = false;

  pedidosActivos: OrdenUsuario[] = [];
  historialPedidos: OrdenUsuario[] = [];
  metodosPago: MetodoPago[] = [];

  nuevoMetodoPago = {
    TipoTarjeta: 'Crédito',
    Titular: '',
    NumeroTarjeta: '',
    Expiracion: ''
  };

  cargando = false;
  mensaje = '';
  mensajeError = '';

  constructor(
    private usuarioService: UsuarioService,
    private productoService: ProductoService,
    private metodoPagoService: MetodoPagoService
  ) { }

  ngOnInit(): void {
    this.cargarUsuario();
  }

  cambiarSeccion(seccion: 'cuenta' | 'pedidos' | 'historial' | 'pagos'): void {
    this.seccionActiva = seccion;
    this.limpiarMensajes();

    if (seccion === 'pedidos') {
      this.cargarPedidosActivos();
    }

    if (seccion === 'historial') {
      this.cargarHistorialPedidos();
    }

    if (seccion === 'pagos') {
      this.cargarMetodosPago();
    }
  }

  cargarUsuario(): void {
    if (!this.usuarioId) {
      this.mensajeError = 'No se encontró el usuario en sesión.';
      return;
    }

    this.cargando = true;

    this.usuarioService.obtenerUsuarioPorId(this.usuarioId).subscribe({
      next: (respuesta: any) => {
        this.cargando = false;

        const data = respuesta.data || respuesta;

        this.usuario = {
          nombre: data.nombre || '',
          correo: data.correo || '',
          direccion: data.direccion || '',
          contacto: data.contacto || ''
        };
      },
      error: (error: any) => {
        this.cargando = false;
        this.mensajeError = error.error?.mensaje || 'No se pudieron cargar los datos del usuario.';
      }
    });
  }

  guardarCambios(): void {
    this.limpiarMensajes();

    if (!this.usuario.nombre.trim()) {
      this.mensajeError = 'El nombre no puede quedar vacío.';
      return;
    }

    if (!this.usuario.correo.trim()) {
      this.mensajeError = 'El correo no puede quedar vacío.';
      return;
    }

    const datos = {
      UsuarioID: this.usuarioId,
      nombre: this.usuario.nombre.trim(),
      correo: this.usuario.correo.trim(),
      direccion: this.usuario.direccion.trim(),
      contacto: this.usuario.contacto.trim()
    };

    this.usuarioService.actualizarUsuario(datos).subscribe({
      next: (respuesta: any) => {
        const data = respuesta.data || respuesta;

        localStorage.setItem('nombreUsuario', data.nombre || this.usuario.nombre);
        localStorage.setItem('correo', data.correo || this.usuario.correo);

        this.mensaje = 'Datos actualizados correctamente.';
      },
      error: (error: any) => {
        this.mensajeError = error.error?.mensaje || 'No se pudieron guardar los cambios.';
      }
    });
  }

  alternarCambioPassword(): void {
    this.mostrarCambioPassword = !this.mostrarCambioPassword;

    if (!this.mostrarCambioPassword) {
      this.limpiarCamposPassword();
    }
  }

  cambiarPassword(): void {
    this.limpiarMensajes();

    if (!this.passwordActual || !this.nuevaPassword || !this.confirmarPassword) {
      this.mensajeError = 'Debe completar todos los campos de contraseña.';
      return;
    }

    if (this.nuevaPassword !== this.confirmarPassword) {
      this.mensajeError = 'La nueva contraseña no coincide con la confirmación.';
      return;
    }

    if (this.nuevaPassword.length < 6) {
      this.mensajeError = 'La nueva contraseña debe tener al menos 6 caracteres.';
      return;
    }

    const data = {
      UsuarioID: this.usuarioId,
      passwordActual: this.passwordActual,
      nuevaPassword: this.nuevaPassword
    };

    this.usuarioService.cambiarPassword(data).subscribe({
      next: () => {
        this.mensaje = 'Contraseña actualizada correctamente.';
        this.limpiarCamposPassword();
        this.mostrarCambioPassword = false;
      },
      error: (error: any) => {
        this.mensajeError = error.error?.mensaje || 'No se pudo cambiar la contraseña.';
      }
    });
  }

  cargarPedidosActivos(): void {
    if (!this.usuarioId) return;

    this.cargando = true;

    this.productoService.obtenerOrdenesActivas(this.usuarioId).subscribe({
      next: (respuesta: any) => {
        this.cargando = false;

        const datos = Array.isArray(respuesta)
          ? respuesta
          : respuesta.data || [];

        this.pedidosActivos = datos.map((orden: any) => this.mapearOrden(orden));
      },
      error: (error: any) => {
        this.cargando = false;
        this.mensajeError = error.error?.mensaje || 'No se pudieron cargar los pedidos activos.';
      }
    });
  }

  cargarHistorialPedidos(): void {
    if (!this.usuarioId) return;

    this.cargando = true;

    this.productoService.obtenerHistorialOrdenes(this.usuarioId).subscribe({
      next: (respuesta: any) => {
        this.cargando = false;

        const datos = Array.isArray(respuesta)
          ? respuesta
          : respuesta.data || [];

        this.historialPedidos = datos.map((orden: any) => this.mapearOrden(orden));
      },
      error: (error: any) => {
        this.cargando = false;
        this.mensajeError = error.error?.mensaje || 'No se pudo cargar el historial.';
      }
    });
  }

  cargarMetodosPago(): void {
    if (!this.usuarioId) return;

    this.cargando = true;

    this.metodoPagoService.obtenerMetodosPago(this.usuarioId).subscribe({
      next: (respuesta: any) => {
        this.cargando = false;

        this.metodosPago = Array.isArray(respuesta)
          ? respuesta
          : respuesta.data || [];
      },
      error: (error: any) => {
        this.cargando = false;
        this.mensajeError = error.error?.mensaje || 'No se pudieron cargar los métodos de pago.';
      }
    });
  }

  agregarMetodoPago(): void {
    this.limpiarMensajes();

    if (
      !this.nuevoMetodoPago.TipoTarjeta ||
      !this.nuevoMetodoPago.Titular.trim() ||
      !this.nuevoMetodoPago.NumeroTarjeta.trim() ||
      !this.nuevoMetodoPago.Expiracion.trim()
    ) {
      this.mensajeError = 'Debe completar todos los datos de la tarjeta.';
      return;
    }

    const numeroLimpio = this.nuevoMetodoPago.NumeroTarjeta.replace(/\s/g, '');

    if (numeroLimpio.length < 12) {
      this.mensajeError = 'El número de tarjeta no parece válido.';
      return;
    }

    const data = {
      UsuarioID: this.usuarioId,
      TipoTarjeta: this.nuevoMetodoPago.TipoTarjeta,
      Titular: this.nuevoMetodoPago.Titular.trim(),
      NumeroTarjeta: numeroLimpio,
      Expiracion: this.nuevoMetodoPago.Expiracion.trim()
    };

    this.metodoPagoService.agregarMetodoPago(data).subscribe({
      next: () => {
        this.mensaje = 'Método de pago agregado correctamente.';

        this.nuevoMetodoPago = {
          TipoTarjeta: 'Crédito',
          Titular: '',
          NumeroTarjeta: '',
          Expiracion: ''
        };

        this.cargarMetodosPago();
      },
      error: (error: any) => {
        this.mensajeError = error.error?.mensaje || 'No se pudo agregar el método de pago.';
      }
    });
  }

  eliminarMetodoPago(metodo: MetodoPago): void {
    const id = metodo.MetodoPagoID || metodo._id;

    if (!id) {
      this.mensajeError = 'No se encontró el ID del método de pago.';
      return;
    }

    const confirmar = confirm('¿Deseas eliminar este método de pago?');

    if (!confirmar) return;

    this.metodoPagoService.eliminarMetodoPago(id).subscribe({
      next: () => {
        this.mensaje = 'Método de pago eliminado correctamente.';
        this.cargarMetodosPago();
      },
      error: (error: any) => {
        this.mensajeError = error.error?.mensaje || 'No se pudo eliminar el método de pago.';
      }
    });
  }

  mapearOrden(orden: any): OrdenUsuario {
    const detallesRaw = Array.isArray(orden.Detalles)
      ? orden.Detalles
      : Array.isArray(orden.detalles)
        ? orden.detalles
        : [];

    const detalles = detallesRaw.map((detalle: any) => this.mapearDetalleOrden(detalle));

    const subtotalCalculado = detalles.reduce((total: number, item: DetalleOrden) => {
      return total + item.totalLinea;
    }, 0);

    return {
      ordenId: orden.OrdenID || orden.ordenId || orden._id || 'N/A',
      fechaOrden: orden.FechaOrden || orden.fechaOrden || orden.FechaCompra || orden.fechaCompra || null,
      subtotal: Number(orden.Subtotal ?? orden.subtotal ?? subtotalCalculado),
      envio: Number(orden.Envio ?? orden.envio ?? 0),
      descuento: Number(orden.Descuento ?? orden.descuento ?? 0),
      total: Number(orden.Total ?? orden.total ?? subtotalCalculado),
      estadoGeneral: orden.EstadoGeneral || orden.estadoGeneral || this.obtenerEstadoGeneralDesdeDetalles(detalles),
      detalles
    };
  }

  obtenerEstadoGeneralDesdeDetalles(detalles: DetalleOrden[]): string {
    if (!detalles || detalles.length === 0) {
      return 'Sin estado';
    }

    const primerDetalle = detalles[0];
    return primerDetalle.estado || 'Sin estado';
  }

  mapearDetalleOrden(detalle: any): DetalleOrden {
    const cantidad = Number(detalle.Cantidad || detalle.cantidad || 1);
    const precioUnitario = Number(detalle.PrecioUnitario || detalle.precioUnitario || 0);

    return {
      carritoId: detalle.CarritoID || detalle.carritoId || detalle._id,
      productoId: detalle.ProductoID || detalle.productoId || '',
      nombre: detalle.NombreProducto || detalle.nombreProducto || 'Producto sin nombre',
      imagen: this.normalizarImagen(detalle.Imagen || detalle.imagen || ''),
      cantidad,
      precioUnitario,
      totalLinea: Number(detalle.TotalLinea || detalle.totalLinea || cantidad * precioUnitario),
      estadoProductoId: Number(detalle.EstadoProductoId || detalle.estadoProductoId || 0),
      estado: detalle.EstadoProducto || detalle.estadoProducto || 'Sin estado'
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

  formatearFecha(fecha: string | null): string {
    if (!fecha) {
      return 'Sin fecha';
    }

    return new Date(fecha).toLocaleDateString('es-SV');
  }

  obtenerClaseEstado(estado: string): string {
    const estadoNormalizado = estado.toLowerCase();

    if (estadoNormalizado.includes('transacción') || estadoNormalizado.includes('transaccion')) {
      return 'bg-warning text-dark';
    }

    if (estadoNormalizado.includes('enviado')) {
      return 'bg-info text-dark';
    }

    if (estadoNormalizado.includes('reparto')) {
      return 'bg-primary';
    }

    if (estadoNormalizado.includes('entregado')) {
      return 'bg-success';
    }

    return 'bg-secondary';
  }

  calcularTotalItems(orden: OrdenUsuario): number {
    return orden.detalles.reduce((total, item) => total + item.cantidad, 0);
  }

  limpiarCamposPassword(): void {
    this.passwordActual = '';
    this.nuevaPassword = '';
    this.confirmarPassword = '';
  }

  limpiarMensajes(): void {
    this.mensaje = '';
    this.mensajeError = '';
  }
}