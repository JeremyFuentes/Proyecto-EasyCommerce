import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { BusquedaService } from '../../../services/busqueda.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  terminoBusqueda = '';
  logueado = false;
  nombreUsuario = '';

  constructor(
    private router: Router,
    private busquedaService: BusquedaService
  ) {
    this.actualizarEstadoSesion();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.actualizarEstadoSesion();
      });
  }

  actualizarEstadoSesion(): void {
    const token = localStorage.getItem('token');
    const tipoLogin = localStorage.getItem('tipoLogin');

    this.logueado = !!token && tipoLogin === 'usuario';
    this.nombreUsuario = localStorage.getItem('nombreUsuario') || '';
  }

  obtenerNombreUsuario(): string {
    return localStorage.getItem('nombreUsuario') || this.nombreUsuario || 'Usuario';
  }

  buscarProducto(): void {
    const termino = this.terminoBusqueda.trim();

    this.busquedaService.establecerBusqueda(termino);
    this.router.navigate(['/productos']);
  }

  limpiarBuscador(): void {
    this.terminoBusqueda = '';
    this.busquedaService.limpiarBusqueda();
    this.router.navigate(['/productos']);
  }

  irADashboard(event?: Event): void {
    if (event) event.preventDefault();
    this.router.navigate(['/dashboard']);
  }

  irAProductos(event?: Event): void {
    if (event) event.preventDefault();

    this.busquedaService.limpiarBusqueda();
    this.router.navigate(['/productos']);
  }

  irAServicios(event?: Event): void {
    if (event) event.preventDefault();
    this.router.navigate(['/servicios']);
  }

  irANosotros(event?: Event): void {
    if (event) event.preventDefault();
    this.router.navigate(['/nosotros']);
  }

  irAPromociones(event?: Event): void {
    if (event) event.preventDefault();
    this.router.navigate(['/promociones']);
  }

  irACarrito(event?: Event): void {
    if (event) event.preventDefault();
    this.router.navigate(['/carrito']);
  }

  irAFavoritos(event?: Event): void {
    if (event) event.preventDefault();
    this.router.navigate(['/favoritos']);
  }

  irAConfiguracion(event?: Event): void {
    if (event) event.preventDefault();
    this.router.navigate(['/configuracion']);
  }

  irALogin(event?: Event): void {
    if (event) event.preventDefault();
    this.router.navigate(['/login']);
  }

  logout(event?: Event): void {
    if (event) event.preventDefault();

    localStorage.removeItem('token');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('nombreUsuario');
    localStorage.removeItem('correo');
    localStorage.removeItem('rol');
    localStorage.removeItem('tipoLogin');

    sessionStorage.clear();

    this.actualizarEstadoSesion();
    this.router.navigate(['/login']);
  }
}