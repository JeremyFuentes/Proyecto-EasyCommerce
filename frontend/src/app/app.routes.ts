import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ProductosListaComponent } from './components/productos-lista/productos-lista';
import { ProductoDetalleComponent } from './components/producto-detalle/producto-detalle';
import { CarritoComponent } from './components/carrito/carrito';
import { FavoritosComponent } from './components/favoritos/favoritos';
import { ConfiguracionComponent } from './components/configuracion/configuracion';
import { ServiciosComponent } from './components/servicios/servicios';
import { NosotrosComponent } from './components/nosotros/nosotros';
import { PromocionesComponent } from './components/promociones/promociones';

import { AdminLoginComponent } from './components/admin-login/admin-login';
import { AdminProductosComponent } from './components/admin-productos/admin-productos';
import { AdminProductoFormComponent } from './components/admin-producto-form/admin-producto-form';
import { AdminUsuariosComponent } from './components/admin-usuarios/admin-usuarios';
import { AdminPedidosComponent } from './components/admin-pedidos/admin-pedidos';
import { AdminAuxiliaresComponent } from './components/admin-auxiliares/admin-auxiliares';

import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'productos', component: ProductosListaComponent },
  { path: 'productos/:id', component: ProductoDetalleComponent },
  { path: 'servicios', component: ServiciosComponent },
  { path: 'nosotros', component: NosotrosComponent },
  { path: 'promociones', component: PromocionesComponent },

  { path: 'carrito', component: CarritoComponent, canActivate: [authGuard] },
  { path: 'favoritos', component: FavoritosComponent, canActivate: [authGuard] },
  { path: 'configuracion', component: ConfiguracionComponent, canActivate: [authGuard] },

  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/productos', component: AdminProductosComponent, canActivate: [adminGuard] },
  { path: 'admin/productos/nuevo', component: AdminProductoFormComponent, canActivate: [adminGuard] },
  { path: 'admin/productos/editar/:id', component: AdminProductoFormComponent, canActivate: [adminGuard] },
  { path: 'admin/usuarios', component: AdminUsuariosComponent, canActivate: [adminGuard] },
  { path: 'admin/pedidos', component: AdminPedidosComponent, canActivate: [adminGuard] },
  { path: 'admin/catalogos', component: AdminAuxiliaresComponent, canActivate: [adminGuard] },

  { path: '**', redirectTo: 'dashboard' }
];