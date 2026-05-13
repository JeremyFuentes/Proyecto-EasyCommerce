import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.css'
})
export class AdminUsuariosComponent implements OnInit {
  @Input() cambiarVista!: (vista: string) => void;
  @Input() cerrarSesion!: () => void;
  @Input() vistaActual = '';

  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];

  busqueda = '';
  mensaje = '';
  mensajeError = '';

  modalAbierto = false;
  modoEdicion = false;

  usuarioSeleccionado = {
    id: '',
    nombre: '',
    correo: '',
    direccion: '',
    contacto: '',
    rol: ''
  };

  nuevaPassword = '';
  confirmarPassword = '';

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (respuesta: any) => {
        this.usuarios = Array.isArray(respuesta)
          ? respuesta
          : respuesta.data || [];

        this.aplicarBusqueda();
      },
      error: (error: any) => {
        this.mensajeError = error.error?.mensaje || 'No se pudieron cargar los usuarios.';
      }
    });
  }

  aplicarBusqueda(): void {
    const texto = this.busqueda.trim().toLowerCase();

    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const nombre = this.obtenerNombre(usuario).toLowerCase();
      const correo = this.obtenerCorreo(usuario).toLowerCase();
      const contacto = this.obtenerContacto(usuario).toLowerCase();

      return (
        !texto ||
        nombre.includes(texto) ||
        correo.includes(texto) ||
        contacto.includes(texto)
      );
    });
  }

  abrirFormulario(usuario?: any): void {
    this.limpiarMensajes();
    this.nuevaPassword = '';
    this.confirmarPassword = '';

    if (usuario) {
      this.modoEdicion = true;

      this.usuarioSeleccionado = {
        id: this.obtenerId(usuario),
        nombre: this.obtenerNombre(usuario),
        correo: this.obtenerCorreo(usuario),
        direccion: this.obtenerDireccion(usuario),
        contacto: this.obtenerContacto(usuario),
        rol: this.obtenerRol(usuario)
      };
    } else {
      this.modoEdicion = false;

      this.usuarioSeleccionado = {
        id: '',
        nombre: '',
        correo: '',
        direccion: '',
        contacto: '',
        rol: 'Cliente'
      };
    }

    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.nuevaPassword = '';
    this.confirmarPassword = '';
  }

  guardarUsuario(): void {
console.log('Botón guardar usuario presionado');
  console.log('Usuario seleccionado:', this.usuarioSeleccionado);

    this.limpiarMensajes();

    if (!this.usuarioSeleccionado.nombre.trim()) {
      this.mensajeError = 'El nombre es obligatorio.';
      return;
    }

    if (!this.usuarioSeleccionado.correo.trim()) {
      this.mensajeError = 'El correo es obligatorio.';
      return;
    }

    if (this.nuevaPassword || this.confirmarPassword) {
      if (this.nuevaPassword !== this.confirmarPassword) {
        this.mensajeError = 'Las contraseñas no coinciden.';
        return;
      }

      if (this.nuevaPassword.length < 6) {
        this.mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
        return;
      }
    }

    const data: any = {
      UsuarioID: this.usuarioSeleccionado.id,
      nombre: this.usuarioSeleccionado.nombre.trim(),
      correo: this.usuarioSeleccionado.correo.trim(),
      direccion: this.usuarioSeleccionado.direccion.trim(),
      contacto: this.usuarioSeleccionado.contacto.trim(),
      rol: this.usuarioSeleccionado.rol
    };

    if (this.nuevaPassword) {
      data.nuevaPassword = this.nuevaPassword;
    }

    this.usuarioService.actualizarUsuarioAdmin(data).subscribe({
      next: () => {
        this.mensaje = 'Usuario actualizado correctamente.';
        this.cerrarModal();
        this.cargarUsuarios();

        setTimeout(() => {
          this.mensaje = '';
        }, 2500);
      },
      error: (error: any) => {
        this.mensajeError = error.error?.mensaje || 'No se pudo guardar el usuario.';
      }
    });
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

  limpiarMensajes(): void {
    this.mensaje = '';
    this.mensajeError = '';
  }

  obtenerId(usuario: any): string {
    return String(usuario?._id || usuario?.UsuarioID || usuario?.usuarioId || usuario?.id || '');
  }

  obtenerNombre(usuario: any): string {
    return usuario?.nombre || usuario?.Nombre || 'Sin nombre';
  }

  obtenerCorreo(usuario: any): string {
    return usuario?.correo || usuario?.Correo || 'Sin correo';
  }

  obtenerDireccion(usuario: any): string {
    return usuario?.direccion || usuario?.Direccion || '';
  }

  obtenerContacto(usuario: any): string {
    return usuario?.contacto || usuario?.Contacto || '';
  }

  obtenerRol(usuario: any): string {
    return usuario?.rol || usuario?.Rol || 'Cliente';
  }
}