import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  urlActual = '';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.urlActual = event.urlAfterRedirects;
      });
  }

  esVistaAdmin(): boolean {
    return this.urlActual.startsWith('/admin');
  }

  esLogin(): boolean {
    return this.urlActual === '/login' || this.urlActual === '/admin/login';
  }

  mostrarNavbar(): boolean {
    return !this.esVistaAdmin() && !this.esLogin();
  }

  mostrarFooter(): boolean {
    return !this.esVistaAdmin() && !this.esLogin();
  }
}