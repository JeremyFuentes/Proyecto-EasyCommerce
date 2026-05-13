import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../services/producto.service';

interface DetalleOrdenAdmin {
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

interface OrdenAdmin {
  ordenId: string | number;
  fechaOrden: string | null;
  subtotal: number;
  envio: number;
  descuento: number;
  total: number;
  estadoGeneral: string;
  usuario: {
    id: string;
    nombre: string;
    correo: string;
    direccion: string;
    contacto: string;
  } | null;
  detalles: DetalleOrdenAdmin[];
}

interface GrupoUsuarioOrdenes {
  usuario: {
    id: string;
    nombre: string;
    correo: string;
    direccion: string;
    contacto: string;
  } | null;
  ordenes: OrdenAdmin[];
}

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-pedidos.html',
  styleUrl: './admin-pedidos.css'
})
export class AdminPedidosComponent implements OnInit {
  @Input() cambiarVista!: (vista: string) => void;
  @Input() cerrarSesion!: () => void;
  @Input() vistaActual = '';

  ordenes: OrdenAdmin[] = [];
  ordenesAgrupadas: GrupoUsuarioOrdenes[] = [];

  cargando = false;
  mensaje = '';
  mensajeError = '';

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    this.cargando = true;
    this.mensaje = '';
    this.mensajeError = '';

    this.productoService.obtenerOrdenesAdmin().subscribe({
      next: (respuesta: any) => {
        this.cargando = false;

        const datos = Array.isArray(respuesta)
          ? respuesta
          : respuesta.data || [];

        this.ordenes = datos.map((orden: any) => this.mapearOrden(orden));
        this.agruparOrdenesPorUsuario();
      },
      error: (error: any) => {
        this.cargando = false;
        this.mensajeError = error.error?.mensaje || 'No se pudieron cargar las órdenes.';
      }
    });
  }

  mapearOrden(orden: any): OrdenAdmin {
    const detallesRaw = Array.isArray(orden.Detalles)
      ? orden.Detalles
      : orden.detalles || [];

    const detalles: DetalleOrdenAdmin[] = detallesRaw.map((detalle: any) =>
      this.mapearDetalle(detalle)
    );

    const subtotalCalculado = detalles.reduce(
      (total: number, item: DetalleOrdenAdmin) => total + item.totalLinea,
      0
    );

    const usuario = orden.Usuario || orden.usuario || null;

    return {
      ordenId: orden.OrdenID || orden.ordenId || orden._id,
      fechaOrden: orden.FechaOrden || orden.fechaOrden || null,
      subtotal: Number(orden.Subtotal ?? orden.subtotal ?? subtotalCalculado),
      envio: Number(orden.Envio ?? orden.envio ?? 0),
      descuento: Number(orden.Descuento ?? orden.descuento ?? 0),
      total: Number(orden.Total ?? orden.total ?? subtotalCalculado),
      estadoGeneral: orden.EstadoGeneral || orden.estadoGeneral || this.obtenerEstadoGeneralDesdeDetalles(detalles),
      usuario: usuario
        ? {
            id: usuario._id || usuario.id || '',
            nombre: usuario.nombre || usuario.Nombre || 'Usuario sin nombre',
            correo: usuario.correo || usuario.Correo || 'Sin correo',
            direccion: usuario.direccion || usuario.Direccion || '',
            contacto: usuario.contacto || usuario.Contacto || ''
          }
        : null,
      detalles
    };
  }

  mapearDetalle(detalle: any): DetalleOrdenAdmin {
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

  obtenerEstadoGeneralDesdeDetalles(detalles: DetalleOrdenAdmin[]): string {
    if (!detalles || detalles.length === 0) return 'Sin estado';

    return detalles[0].estado || 'Sin estado';
  }

  agruparOrdenesPorUsuario(): void {
    const grupos = new Map<string, GrupoUsuarioOrdenes>();

    for (const orden of this.ordenes) {
      const usuarioId = orden.usuario?.id || 'sin-usuario';

      if (!grupos.has(usuarioId)) {
        grupos.set(usuarioId, {
          usuario: orden.usuario,
          ordenes: []
        });
      }

      grupos.get(usuarioId)?.ordenes.push(orden);
    }

    this.ordenesAgrupadas = Array.from(grupos.values());
  }

  avanzarEstadoOrden(orden: OrdenAdmin): void {
    const estadoId = this.obtenerEstadoIdOrden(orden);

    if (estadoId >= 5) {
      this.mensajeError = 'Esta orden ya fue entregada.';

      setTimeout(() => {
        this.mensajeError = '';
      }, 2500);

      return;
    }

    const confirmar = confirm(`¿Deseas avanzar el estado de la orden #${orden.ordenId}?`);

    if (!confirmar) return;

    this.productoService.avanzarEstadoOrdenAdmin(orden.ordenId).subscribe({
      next: () => {
        this.mensaje = 'Estado de la orden actualizado correctamente.';
        this.cargarOrdenes();

        setTimeout(() => {
          this.mensaje = '';
        }, 2500);
      },
      error: (error: any) => {
        this.mensajeError = error.error?.mensaje || 'No se pudo actualizar el estado de la orden.';

        setTimeout(() => {
          this.mensajeError = '';
        }, 3000);
      }
    });
  }

  obtenerEstadoIdOrden(orden: OrdenAdmin): number {
    if (!orden.detalles || orden.detalles.length === 0) return 0;

    return Math.min(...orden.detalles.map(item => item.estadoProductoId));
  }

  obtenerTextoBoton(orden: OrdenAdmin): string {
    const estadoId = this.obtenerEstadoIdOrden(orden);

    if (estadoId === 2) return 'Marcar como Enviado';
    if (estadoId === 3) return 'Marcar En Reparto';
    if (estadoId === 4) return 'Marcar Entregado';
    if (estadoId >= 5) return 'Entregado';

    return 'Avanzar estado';
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

  calcularTotalItems(orden: OrdenAdmin): number {
    return orden.detalles.reduce(
      (total: number, item: DetalleOrdenAdmin) => total + item.cantidad,
      0
    );
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) return 'Sin fecha';

    return new Date(fecha).toLocaleDateString('es-SV');
  }

  normalizarImagen(imagen: string): string {
    if (!imagen) return 'assets/img/EasyCommerce.png';
    if (imagen.startsWith('http')) return imagen;
    if (imagen.startsWith('data:image')) return imagen;
    if (imagen.startsWith('assets/')) return imagen;
    if (imagen.startsWith('/')) return `http://localhost:3000${imagen}`;

    return imagen;
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
}