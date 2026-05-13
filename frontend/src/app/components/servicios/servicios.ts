import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css'
})
export class ServiciosComponent {
  servicios = [
    {
      icono: 'fa fa-tools',
      titulo: 'Instalación de Equipos',
      descripcion: 'Ofrecemos instalación profesional de los equipos adquiridos, asegurando su correcto funcionamiento y garantía.'
    },
    {
      icono: 'fa fa-shield-alt',
      titulo: 'Garantía Extendida',
      descripcion: 'Extiende la protección de tus productos con nuestra garantía adicional, válida hasta por 2 años más.'
    },
    {
      icono: 'fa fa-headset',
      titulo: 'Soporte Técnico',
      descripcion: 'Nuestro equipo técnico está disponible para asistirte remotamente o en sitio ante cualquier inconveniente.'
    }
  ];
}