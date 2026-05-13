import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusquedaService } from '../../../services/busqueda.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  @Input() cambiarVista!: (vista: string) => void;
  @Input() cerrarSesion!: () => void;
  @Input() logueado!: boolean;

  terminoBusqueda = '';

  constructor(private busquedaService: BusquedaService) {}

  buscarProducto(): void {
    const termino = this.terminoBusqueda.trim();

    this.busquedaService.establecerBusqueda(termino);

    if (this.cambiarVista) {
      this.cambiarVista('lista');
    }
  }

  limpiarBuscador(): void {
    this.terminoBusqueda = '';
    this.busquedaService.limpiarBusqueda();

    if (this.cambiarVista) {
      this.cambiarVista('lista');
    }
  }

  nombreUsuario = localStorage.getItem('nombreUsuario') || '';

obtenerNombreUsuario(): string {
  return localStorage.getItem('nombreUsuario') || this.nombreUsuario || 'Usuario';
}

  irADashboard(event: Event): void {
    event.preventDefault();
    this.cambiarVista('dashboard');
  }

  irAProductos(event: Event): void {
    event.preventDefault();
    this.cambiarVista('lista');
  }

  irAServicios(event: Event): void {
  event.preventDefault();
  this.cambiarVista('servicios');
}

irANosotros(event: Event): void {
  event.preventDefault();
  this.cambiarVista('nosotros');
}

irAPromociones(event: Event): void {
  event.preventDefault();
  this.cambiarVista('promociones');
}

irACarrito(event: Event): void {
  event.preventDefault();
  this.cambiarVista('carrito');
}

irAFavoritos(event: Event): void {
  event.preventDefault();
  this.cambiarVista('favoritos');
}

irAConfiguracion(event: Event): void {
  event.preventDefault();
  this.cambiarVista('configuracion');
}

irALogin(event?: Event): void {
  if (event) {
    event.preventDefault();
  }

  this.cambiarVista('login');
}

  logout(event: Event): void {
    event.preventDefault();
    this.cerrarSesion();
  }
}