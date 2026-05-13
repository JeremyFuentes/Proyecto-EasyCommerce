import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, LoginResponse } from '../../../services/auth.service';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  @Input() loginExitoso!: () => void;

  modo: 'login' | 'registro' = 'login';

  login = {
    correo: '',
    password: ''
  };

  registro = {
    nombre: '',
    correo: '',
    password: '',
    confirmPassword: ''
  };

  errorLogin = '';
  errorRegister = '';
  errorPasswordMatch = false;
  mensajeRegistro = '';

  constructor(private authService: AuthService) { }

  mostrarRegistro(event: Event): void {
    event.preventDefault();
    this.modo = 'registro';
    this.limpiarMensajes();
  }

  mostrarLogin(event: Event): void {
    event.preventDefault();
    this.modo = 'login';
    this.limpiarMensajes();
  }

  iniciarSesion(): void {
    this.limpiarMensajes();

    if (!this.login.correo || !this.login.password) {
      this.errorLogin = 'Debe ingresar correo y contraseña.';
      return;
    }

    this.authService.login(this.login.correo, this.login.password).subscribe({
      next: (respuesta) => {
        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('usuarioId', respuesta.usuarioId || respuesta.idUsuario || respuesta.usuario?.id || '');
        localStorage.setItem('nombreUsuario', respuesta.nombre || respuesta.usuario?.nombre || '');
        localStorage.setItem('rol', respuesta.rol || respuesta.usuario?.rol || '');

        localStorage.setItem('tipoLogin', 'usuario');

        sessionStorage.setItem('vistaActual', 'dashboard');

        this.loginExitoso();
      },
      error: () => {
        this.errorLogin = 'Credenciales incorrectas.';
      }
    });
  }

  ngAfterViewInit(): void {
    this.inicializarGoogleLogin();
  }

  inicializarGoogleLogin(): void {
    if (typeof google === 'undefined') {
      console.warn('Google Identity Services no está disponible.');
      return;
    }

    google.accounts.id.initialize({
      client_id:  "1061598003253-nckg92upuboohhhhp78a9qrvd6qjoooq.apps.googleusercontent.com",
      callback: (response: any) => this.procesarLoginGoogle(response)
    });


    google.accounts.id.renderButton(
      document.getElementById('googleButton'),
      {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'signin_with'
      }
    );
  }

  procesarLoginGoogle(response: any): void {
    const idToken = response.credential;

    if (!idToken) {
      this.errorLogin = 'No se recibió el token de Google.';
      return;
    }

    this.authService.loginGoogle(idToken).subscribe({
      next: (respuesta: LoginResponse) => {
        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('usuarioId', respuesta.usuarioId || respuesta.idUsuario || respuesta.usuario?.id || '');
        localStorage.setItem('nombreUsuario', respuesta.nombre || respuesta.usuario?.nombre || 'Usuario');
        localStorage.setItem('correo', respuesta.correo || respuesta.usuario?.correo || '');
        localStorage.setItem('rol', respuesta.rol || respuesta.usuario?.rol || 'Cliente');
        localStorage.setItem('tipoLogin', 'usuario');

        sessionStorage.setItem('vistaActual', 'dashboard');

        this.loginExitoso();
      },
      error: (error: any) => {
        this.errorLogin = error.error?.mensaje || 'No se pudo iniciar sesión con Google.';
      }
    });
  }

  registrarUsuario(): void {
    this.limpiarMensajes();

    if (this.registro.password !== this.registro.confirmPassword) {
      this.errorPasswordMatch = true;
      return;
    }

    const nuevoUsuario = {
      nombre: this.registro.nombre,
      correo: this.registro.correo,
      password: this.registro.password,
      rol: 'Cliente'
    };

    this.authService.registrar(nuevoUsuario).subscribe({
      next: () => {
        this.mensajeRegistro = 'Usuario registrado correctamente. Ahora puede iniciar sesión.';

        this.registro = {
          nombre: '',
          correo: '',
          password: '',
          confirmPassword: ''
        };

        setTimeout(() => {
          this.modo = 'login';
          this.mensajeRegistro = '';
        }, 2000);
      },
      error: (error) => {
        this.errorRegister = error.error?.mensaje || 'Error al registrar usuario.';
      }
    });
  }

  limpiarMensajes(): void {
    this.errorLogin = '';
    this.errorRegister = '';
    this.errorPasswordMatch = false;
    this.mensajeRegistro = '';
  }
}