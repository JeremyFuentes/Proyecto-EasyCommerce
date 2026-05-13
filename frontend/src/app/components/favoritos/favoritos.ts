import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../services/producto.service';

interface ProductoFavorito {
  favoritoId: number | string;
  productoId: number | string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  productoOriginal: any;
}

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css'
})
export class FavoritosComponent implements OnInit {
  @Input() verDetalleProducto!: (producto: any) => void;
  @Input() cambiarVista!: (vista: string) => void;

  favoritos: ProductoFavorito[] = [];

  cargando = false;
  mensaje = '';
  mensajeError = '';

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarFavoritos();
  }

  cargarFavoritos(): void {
    const usuarioId = localStorage.getItem('usuarioId');

    if (!usuarioId) {
      this.mensajeError = 'No se encontró el usuario en sesión.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    this.productoService.obtenerFavoritosUsuario(usuarioId).subscribe({
      next: (respuesta: any) => {
        this.cargando = false;

        const datos = Array.isArray(respuesta)
          ? respuesta
          : respuesta.data || [];

        this.favoritos = datos
          .filter((item: any) => item.Producto || item.producto)
          .map((item: any) => this.mapearFavorito(item));
      },
      error: (error: any) => {
        this.cargando = false;
        this.mensajeError = error.error?.mensaje || 'No se pudieron cargar los favoritos.';
      }
    });
  }

  mapearFavorito(item: any): ProductoFavorito {
    const producto = item.Producto || item.producto || {};

    return {
      favoritoId: item.FavoritoID || item.favoritoId || item._id,
      productoId: producto.ProductoID || producto.productoId || item.ProductoID || item.productoId,
      nombre: producto.Nombre || producto.nombre || 'Producto sin nombre',
      descripcion: producto.Descripcion || producto.descripcion || 'Sin descripción disponible.',
      precio: Number(producto.Precio || producto.precio || 0),
      imagen: this.normalizarImagen(producto.Imagen || producto.imagen || ''),
      productoOriginal: producto
    };
  }

  normalizarImagen(imagen: string): string {
    if (!imagen) {
      return 'assets/img/EasyCommerce.png';
    }

    if (imagen.startsWith('http')) {
      return imagen;
    }

    if (imagen.startsWith('data:image')) {
      return imagen;
    }

    if (imagen.startsWith('assets/')) {
      return imagen;
    }

    if (imagen.startsWith('/')) {
      return `http://localhost:3000${imagen}`;
    }

    return imagen;
  }

  eliminarFavorito(favorito: ProductoFavorito): void {
    const confirmar = confirm(`¿Deseas quitar "${favorito.nombre}" de favoritos?`);

    if (!confirmar) return;

    this.productoService.eliminarFavoritoPorProducto(favorito.productoId).subscribe({
      next: () => {
        this.favoritos = this.favoritos.filter(
          item => String(item.productoId) !== String(favorito.productoId)
        );

        this.mensaje = 'Producto eliminado de favoritos.';

        setTimeout(() => {
          this.mensaje = '';
        }, 2500);
      },
      error: (error: any) => {
        this.mensajeError = error.error?.mensaje || 'No se pudo eliminar el favorito.';

        setTimeout(() => {
          this.mensajeError = '';
        }, 3000);
      }
    });
  }

  verDetalle(favorito: ProductoFavorito): void {
    if (this.verDetalleProducto) {
      this.verDetalleProducto(favorito.productoOriginal);
    }
  }

  irAProductos(): void {
    if (this.cambiarVista) {
      this.cambiarVista('lista');
    }
  }
}