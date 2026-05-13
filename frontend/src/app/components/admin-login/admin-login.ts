import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginResponse } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLoginComponent implements OnInit {
  correoAdmin = '';
  passwordAdmin = '';
  errorAdminLogin = '';
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    const tipoLogin = localStorage.getItem('tipoLogin');

    if (token && rol === 'Administrador' && tipoLogin === 'admin') {
      this.router.navigate(['/admin/productos']);
    }
  }

  iniciarSesionAdmin(): void {
    this.errorAdminLogin = '';

    if (!this.correoAdmin || !this.passwordAdmin) {
      this.errorAdminLogin = 'Debe ingresar correo y contraseña.';
      return;
    }

    this.cargando = true;

    this.authService.loginAdmin(this.correoAdmin, this.passwordAdmin).subscribe({
      next: (respuesta: LoginResponse) => {
        this.cargando = false;

        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('usuarioId', respuesta.usuarioId || respuesta.idUsuario || respuesta.usuario?.id || '');
        localStorage.setItem('nombreUsuario', respuesta.nombre || respuesta.usuario?.nombre || 'Administrador');
        localStorage.setItem('correo', respuesta.correo || respuesta.usuario?.correo || this.correoAdmin);
        localStorage.setItem('rol', respuesta.rol || respuesta.usuario?.rol || 'Administrador');
        localStorage.setItem('tipoLogin', 'admin');

        this.router.navigate(['/admin/productos']);
      },
      error: (error: any) => {
        this.cargando = false;

        if (error.status === 403) {
          this.errorAdminLogin = error.error?.mensaje || 'Acceso denegado. IP no autorizada o usuario sin permisos.';
          return;
        }

        if (error.status === 401) {
          this.errorAdminLogin = 'Credenciales incorrectas.';
          return;
        }

        this.errorAdminLogin = 'Error al conectar con el servidor.';
      }
    });
  }
}