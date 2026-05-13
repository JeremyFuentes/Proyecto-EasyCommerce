import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';

type TipoGestion = 'categorias' | 'marcas' | 'proveedores';

@Component({
  selector: 'app-admin-auxiliares',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-auxiliares.html',
  styleUrl: './admin-auxiliares.css'
})
export class AdminAuxiliaresComponent implements OnInit {
  @Input() cambiarVista!: (vista: string) => void;
  @Input() cerrarSesion!: () => void;
  @Input() vistaActual = '';

  seccionActiva: TipoGestion = 'categorias';

  categorias: any[] = [];
  marcas: any[] = [];
  proveedores: any[] = [];

  modalAbierto = false;
  modoEdicion = false;

  itemActual: any = {
    id: '',
    nombre: '',
    descripcion: '',
    contacto: '',
    correo: ''
  };

  mensaje = '';
  mensajeError = '';

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cambiarSeccion(seccion: TipoGestion): void {
    this.seccionActiva = seccion;
    this.limpiarMensajes();
  }

  cargarDatos(): void {
    this.productoService.obtenerCategorias().subscribe({
      next: (respuesta: any) => {
        const datos = respuesta.data || respuesta || [];
        this.categorias = datos;
      }
    });

    this.productoService.obtenerMarcas().subscribe({
      next: (respuesta: any) => {
        const datos = respuesta.data || respuesta || [];
        this.marcas = datos;
      }
    });

    this.productoService.obtenerProveedores().subscribe({
      next: (respuesta: any) => {
        const datos = respuesta.data || respuesta || [];
        this.proveedores = datos;
      }
    });
  }

  abrirModal(item?: any): void {
    this.limpiarMensajes();

    if (item) {
      this.modoEdicion = true;

      this.itemActual = {
        id: this.obtenerId(item),
        nombre: this.obtenerNombre(item),
        descripcion: this.obtenerDescripcion(item),
        contacto: this.obtenerContacto(item),
        correo: this.obtenerCorreo(item)
      };
    } else {
      this.modoEdicion = false;

      this.itemActual = {
        id: '',
        nombre: '',
        descripcion: '',
        contacto: '',
        correo: ''
      };
    }

    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.mensajeError = '';
  }

  guardarItem(): void {
    this.limpiarMensajes();

    if (!this.itemActual.nombre.trim()) {
      this.mensajeError = 'El nombre es obligatorio.';
      return;
    }

    const nombreNuevo = this.itemActual.nombre.trim().toLowerCase();

    const existeLocal = this.obtenerListaActual().some((item: any) => {
      const idActual = String(this.obtenerId(item));
      const idEditando = String(this.itemActual.id);
      const nombreActual = this.obtenerNombre(item).trim().toLowerCase();

      return nombreActual === nombreNuevo && idActual !== idEditando;
    });

    if (existeLocal) {
      this.mensajeError = `Ya existe un registro con el nombre "${this.itemActual.nombre}".`;
      return;
    }

    if (this.seccionActiva === 'categorias') {
      this.guardarCategoria();
      return;
    }

    if (this.seccionActiva === 'marcas') {
      this.guardarMarca();
      return;
    }

    if (this.seccionActiva === 'proveedores') {
      this.guardarProveedor();
      return;
    }
  }

  guardarCategoria(): void {
    const data = {
      Nombre: this.itemActual.nombre.trim(),
      Descripcion: this.itemActual.descripcion.trim()
    };

    const peticion = this.modoEdicion
      ? this.productoService.actualizarCategoria(this.itemActual.id, data)
      : this.productoService.crearCategoria(data);

    peticion.subscribe({
      next: () => {
        this.mensaje = this.modoEdicion ? 'Categoría actualizada.' : 'Categoría creada.';
        this.cerrarModal();
        this.cargarDatos();
      },
      error: (error: any) => {
        if (error.status === 409) {
          this.mensajeError = error.error?.mensaje || 'Ya existe un registro con ese nombre.';
          return;
        }

        this.mensajeError = error.error?.mensaje || 'No se pudo guardar el registro.';
      }
    });
  }

  guardarMarca(): void {
    const data = {
      Nombre: this.itemActual.nombre.trim()
    };

    const peticion = this.modoEdicion
      ? this.productoService.actualizarMarca(this.itemActual.id, data)
      : this.productoService.crearMarca(data);

    peticion.subscribe({
      next: () => {
        this.mensaje = this.modoEdicion ? 'Marca actualizada.' : 'Marca creada.';
        this.cerrarModal();
        this.cargarDatos();
      },
      error: (error: any) => {
        if (error.status === 409) {
          this.mensajeError = error.error?.mensaje || 'Ya existe un registro con ese nombre.';
          return;
        }

        this.mensajeError = error.error?.mensaje || 'No se pudo guardar el registro.';
      }
    });
  }

  guardarProveedor(): void {
    const data = {
      Nombre: this.itemActual.nombre.trim(),
      Contacto: this.itemActual.contacto.trim(),
      Correo: this.itemActual.correo.trim()
    };

    const peticion = this.modoEdicion
      ? this.productoService.actualizarProveedor(this.itemActual.id, data)
      : this.productoService.crearProveedor(data);

    peticion.subscribe({
      next: () => {
        this.mensaje = this.modoEdicion ? 'Proveedor actualizado.' : 'Proveedor creado.';
        this.cerrarModal();
        this.cargarDatos();
      },
      error: (error: any) => {
        if (error.status === 409) {
          this.mensajeError = error.error?.mensaje || 'Ya existe un registro con ese nombre.';
          return;
        }

        this.mensajeError = error.error?.mensaje || 'No se pudo guardar el registro.';
      }
    });
  }

  eliminarItem(item: any): void {
    const id = this.obtenerId(item);
    const nombre = this.obtenerNombre(item);

    const confirmar = confirm(`¿Deseas eliminar "${nombre}"?`);

    if (!confirmar) return;

    let peticion;

    if (this.seccionActiva === 'categorias') {
      peticion = this.productoService.eliminarCategoria(id);
    } else if (this.seccionActiva === 'marcas') {
      peticion = this.productoService.eliminarMarca(id);
    } else {
      peticion = this.productoService.eliminarProveedor(id);
    }

    peticion.subscribe({
      next: () => {
        this.mensaje = 'Registro eliminado correctamente.';
        this.cargarDatos();
      },
      error: (error: any) => {
        this.mensajeError = error.error?.mensaje || 'No se pudo eliminar el registro.';
      }
    });
  }

  obtenerListaActual(): any[] {
    if (this.seccionActiva === 'categorias') return this.categorias;
    if (this.seccionActiva === 'marcas') return this.marcas;
    return this.proveedores;
  }

  obtenerTitulo(): string {
    if (this.seccionActiva === 'categorias') return 'Categorías';
    if (this.seccionActiva === 'marcas') return 'Marcas';
    return 'Proveedores';
  }

  obtenerId(item: any): string | number {
    return item.CategoriaID || item.MarcaID || item.ProveedorID || item.id || item._id || '';
  }

  obtenerNombre(item: any): string {
    return item.Nombre || item.nombre || '';
  }

  obtenerDescripcion(item: any): string {
    return item.Descripcion || item.descripcion || '';
  }

  obtenerContacto(item: any): string {
    return item.Contacto || item.contacto || '';
  }

  obtenerCorreo(item: any): string {
    return item.Correo || item.correo || '';
  }

  limpiarMensajes(): void {
    this.mensaje = '';
    this.mensajeError = '';
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