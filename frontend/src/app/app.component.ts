import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ProductosListaComponent } from './components/productos-lista/productos-lista';
import { ProductoCrearComponent } from './components/producto-crear/producto-crear';
import { ProductoEditarComponent } from './components/producto-editar/producto-editar';
import { NavbarComponent } from './components/navbar/navbar';
import { Producto } from '../models/producto.model';
import { FooterComponent } from './components/footer/footer';
import { ServiciosComponent } from './components/servicios/servicios';
import { NosotrosComponent } from './components/nosotros/nosotros';
import { PromocionesComponent } from './components/promociones/promociones';
import { CarritoComponent } from './components/carrito/carrito';
import { FavoritosComponent } from './components/favoritos/favoritos';
import { ConfiguracionComponent } from './components/configuracion/configuracion';
import { AdminLoginComponent } from './components/admin-login/admin-login';
import { AdminProductosComponent } from './components/admin-productos/admin-productos';
import { AdminProductoFormComponent } from './components/admin-producto-form/admin-producto-form';
import { AdminUsuariosComponent } from './components/admin-usuarios/admin-usuarios';
import { AdminPedidosComponent } from './components/admin-pedidos/admin-pedidos';
import { ProductoDetalleComponent } from './components/producto-detalle/producto-detalle';
import { AdminAuxiliaresComponent } from './components/admin-auxiliares/admin-auxiliares';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LoginComponent,
    DashboardComponent,
    ProductosListaComponent,
    ProductoCrearComponent,
    ProductoEditarComponent,
    NavbarComponent,
    FooterComponent,
    ServiciosComponent,
    NosotrosComponent,
    PromocionesComponent,
    CarritoComponent,
    FavoritosComponent,
    ConfiguracionComponent,
    AdminLoginComponent,
    AdminProductosComponent,
    AdminProductoFormComponent,
    AdminUsuariosComponent,
    AdminPedidosComponent,
    ProductoDetalleComponent,
    AdminAuxiliaresComponent
  ],
  template: `
<app-navbar
  *ngIf="vista !== 'login' && vista !== 'admin-login' && !esVistaAdmin()"
  [cambiarVista]="cambiarVista.bind(this)"
  [logueado]="logueado"
  [cerrarSesion]="cerrarSesion.bind(this)">
</app-navbar>

  <div *ngIf="mensajeLogin" class="alert alert-success text-center m-2">
    {{ mensajeLogin }}
  </div>

  <div [ngSwitch]="vista">

<app-login
  *ngSwitchCase="'login'"
  [loginExitoso]="iniciarSesionUsuario.bind(this)">
</app-login>

    <app-dashboard
  *ngSwitchCase="'dashboard'"
  [cambiarVista]="cambiarVista.bind(this)"
  [verDetalleProducto]="irADetalleProducto.bind(this)">
</app-dashboard>

<app-productos-lista
  *ngSwitchCase="'lista'"
  [editarProducto]="irAEditarProducto.bind(this)"
  [verDetalleProducto]="irADetalleProducto.bind(this)"
  [cambiarVista]="cambiarVista.bind(this)">
</app-productos-lista>

    <app-producto-crear
      *ngSwitchCase="'crear'">
    </app-producto-crear>

    <app-producto-editar
      *ngSwitchCase="'editar'"
      [productoSeleccionado]="productoSeleccionado"
      [volverALista]="volverALista.bind(this)">
    </app-producto-editar>

    <app-servicios
      *ngSwitchCase="'servicios'">
    </app-servicios>

    <app-nosotros *ngSwitchCase="'nosotros'"></app-nosotros>

    <app-promociones
  *ngSwitchCase="'promociones'"
  [cambiarVista]="cambiarVista.bind(this)">
</app-promociones>

<app-carrito *ngSwitchCase="'carrito'"></app-carrito>

<app-favoritos
  *ngSwitchCase="'favoritos'"
  [verDetalleProducto]="irADetalleProducto.bind(this)"
  [cambiarVista]="cambiarVista.bind(this)">
</app-favoritos>

<app-configuracion
  *ngSwitchCase="'configuracion'"
  [cerrarSesion]="cerrarSesion.bind(this)">
</app-configuracion>

<app-admin-login
  *ngSwitchCase="'admin-login'"
  [loginAdminExitoso]="iniciarSesionAdmin.bind(this)">
</app-admin-login>

<app-admin-productos
  *ngSwitchCase="'admin-productos'"
  [vistaActual]="vista"
  [cambiarVista]="cambiarVista.bind(this)"
  [cerrarSesion]="cerrarSesion.bind(this)"
  [editarProducto]="irAEditarProducto.bind(this)"
  [crearProducto]="irACrearProducto.bind(this)">
</app-admin-productos>

<app-admin-producto-form
  *ngSwitchCase="'admin-crear-producto'"
  [productoSeleccionado]="null"
  [volver]="volverAdminProductos.bind(this)"
  [cambiarVista]="cambiarVista.bind(this)">
</app-admin-producto-form>

<app-admin-producto-form
  *ngSwitchCase="'admin-editar-producto'"
  [productoSeleccionado]="productoSeleccionado"
  [volver]="volverAdminProductos.bind(this)"
  [cambiarVista]="cambiarVista.bind(this)">
</app-admin-producto-form>

<app-admin-usuarios
  *ngSwitchCase="'admin-usuarios'"
  [vistaActual]="vista"
  [cambiarVista]="cambiarVista.bind(this)"
  [cerrarSesion]="cerrarSesion.bind(this)">
</app-admin-usuarios>

<app-admin-pedidos
  *ngSwitchCase="'admin-pedidos'"
  [vistaActual]="vista"
  [cambiarVista]="cambiarVista.bind(this)"
  [cerrarSesion]="cerrarSesion.bind(this)">
</app-admin-pedidos>

<app-producto-detalle
  *ngSwitchCase="'detalle-producto'"
  [productoSeleccionado]="productoSeleccionado"
  [cambiarVista]="cambiarVista.bind(this)">
</app-producto-detalle>

<app-admin-auxiliares
  *ngSwitchCase="'admin-auxiliares'"
  [vistaActual]="vista"
  [cambiarVista]="cambiarVista.bind(this)"
  [cerrarSesion]="cerrarSesion.bind(this)">
</app-admin-auxiliares>

  </div>

  <app-footer *ngIf="vista !== 'login' && vista !== 'admin-login' && !esVistaAdmin()"></app-footer>
`
})
export class AppComponent {

  productoSeleccionado: Producto | null = null;

  logueado = !!localStorage.getItem('token');
  mensajeLogin = '';

  vista = this.obtenerVistaInicial()

  cambiarVista(vista: string): void {
    const vistasPublicas = [
      'dashboard',
      'lista',
      'detalle-producto',
      'servicios',
      'nosotros',
      'promociones',
      'login',
      'admin-login'
    ];

    const vistasPrivadasUsuario = [
      'carrito',
      'favoritos',
      'configuracion',
      'crear',
      'editar'
    ];

    const vistasAdmin = [
      'admin-productos',
      'admin-crear-producto',
      'admin-editar-producto',
      'admin-usuarios',
      'admin-pedidos',
      'admin-auxiliares'
    ];

    if (vistasPublicas.includes(vista)) {
      this.vista = vista;
      sessionStorage.setItem('vistaActual', vista);
      return;
    }

    if (vistasPrivadasUsuario.includes(vista) && !this.logueado) {
      this.vista = 'login';
      sessionStorage.setItem('vistaActual', 'login');
      return;
    }

    if (vistasAdmin.includes(vista) && !this.esAdmin()) {
      this.vista = this.logueado ? 'dashboard' : 'login';
      sessionStorage.setItem('vistaActual', this.vista);
      return;
    }

    this.vista = vista;
    sessionStorage.setItem('vistaActual', vista);
  }

  irADetalleProducto(producto: any): void {
  this.productoSeleccionado = { ...producto };
  this.vista = 'detalle-producto';
  sessionStorage.setItem('vistaActual', 'detalle-producto');
}

  iniciarSesion(): void {
    this.logueado = true;

    if (this.esAdmin()) {
      this.vista = 'admin-productos';
    } else {
      this.vista = 'dashboard';
    }

    this.mensajeLogin = '✔ Inicio de sesión correcto';

    setTimeout(() => {
      this.mensajeLogin = '';
    }, 3000);
  }

  obtenerVistaInicial(): string {
    const params = new URLSearchParams(window.location.search);
    const accesoAdmin = params.get('admin');

    if (accesoAdmin === 'login') {
      return 'admin-login';
    }

    if (!this.logueado) {
      return 'dashboard';
    }

    const vistaGuardada = sessionStorage.getItem('vistaActual');

    if (vistaGuardada) {
      const vistasAdmin = [
        'admin-productos',
        'admin-crear-producto',
        'admin-editar-producto',
        'admin-usuarios',
        'admin-pedidos',
        'admin-auxiliares'
      ];

      if (vistasAdmin.includes(vistaGuardada)) {
        return this.esAdmin() ? vistaGuardada : 'dashboard';
      }

      return vistaGuardada;
    }

    return this.esAdmin() ? 'admin-productos' : 'dashboard';
  }

  cerrarSesion(): void {
    const estabaEnVistaAdmin = this.esVistaAdmin();

    localStorage.clear();
    sessionStorage.clear();

    this.logueado = false;
    this.productoSeleccionado = null;

    if (estabaEnVistaAdmin) {
      this.vista = 'admin-login';
      sessionStorage.setItem('vistaActual', 'admin-login');
    } else {
      this.vista = 'login';
      sessionStorage.setItem('vistaActual', 'login');
    }
  }

    irAEditarProducto(producto: any): void {
  this.productoSeleccionado = { ...producto };
  this.vista = 'admin-editar-producto';
  sessionStorage.setItem('vistaActual', 'admin-editar-producto');
}

irACrearProducto(): void {
  this.productoSeleccionado = null;
  this.vista = 'admin-crear-producto';
  sessionStorage.setItem('vistaActual', 'admin-crear-producto');
}


volverAdminProductos(): void {
  this.productoSeleccionado = null;
  this.vista = 'admin-productos';
  sessionStorage.setItem('vistaActual', 'admin-productos');
}

  irAEditarProductoAdmin(producto: any): void {
    this.productoSeleccionado = { ...producto };
    this.vista = 'admin-editar-producto';
  }

  volverALista(): void {
    this.cambiarVista('lista');
  }

  obtenerRol(): string {
    return localStorage.getItem('rol') || '';
  }

  obtenerTipoLogin(): string {
    return localStorage.getItem('tipoLogin') || '';
  }

  esAdmin(): boolean {
    return this.obtenerRol() === 'Administrador' && this.obtenerTipoLogin() === 'admin';
  }

  iniciarSesionUsuario(): void {
    this.logueado = true;
    this.vista = 'dashboard';
    sessionStorage.setItem('vistaActual', 'dashboard');

    this.mensajeLogin = '✔ Inicio de sesión correcto';

    setTimeout(() => {
      this.mensajeLogin = '';
    }, 3000);
  }

  iniciarSesionAdmin(): void {
    this.logueado = true;

    if (this.esAdmin()) {
      this.vista = 'admin-productos';
      sessionStorage.setItem('vistaActual', 'admin-productos');
    } else {
      this.vista = 'admin-login';
      sessionStorage.setItem('vistaActual', 'admin-login');
    }

    this.mensajeLogin = '✔ Inicio de sesión administrador correcto';

    setTimeout(() => {
      this.mensajeLogin = '';
    }, 3000);
  }

  esVistaAdmin(): boolean {
    return [
      'admin-login',
      'admin-dashboard',
      'admin-productos',
      'admin-crear-producto',
      'admin-editar-producto',
      'admin-usuarios',
      'admin-pedidos',
      'admin-auxiliares'
    ].includes(this.vista);
  }
}