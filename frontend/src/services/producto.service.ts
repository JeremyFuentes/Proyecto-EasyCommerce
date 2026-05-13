import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductoResponse {
  mensaje?: string;
  total?: number;
  data: any[];
}

export interface ProductoDetalleResponse {
  mensaje?: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'https://easycommerce.onrender.com';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // =========================
  // PRODUCTOS
  // =========================

  obtenerProductos(): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(
      `${this.apiUrl}/productos/ObtenerTodos`
    );
  }

  obtenerProductoPorId(id: string | number): Observable<ProductoDetalleResponse> {
    return this.http.get<ProductoDetalleResponse>(
      `${this.apiUrl}/productos/ObtenerporId/${id}`
    );
  }

  filtrarProductos(
    categoriaId?: string,
    marcaId?: string,
    precioMax?: number | string,
    busqueda?: string
  ): Observable<ProductoResponse> {
    let params = new HttpParams();

    if (categoriaId) {
      params = params.set('categoriaId', categoriaId);
    }

    if (marcaId) {
      params = params.set('marcaId', marcaId);
    }

    if (precioMax) {
      params = params.set('precioMax', String(precioMax));
    }

    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }

    return this.http.get<ProductoResponse>(
      `${this.apiUrl}/productos/filtrar`,
      { params }
    );
  }

  crearProducto(producto: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/productos/RegistrarConImagenes`,
      producto,
      { headers: this.getHeaders() }
    );
  }

  actualizarProducto(producto: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/productos/ActualizarProducto`,
      producto,
      { headers: this.getHeaders() }
    );
  }

  eliminarProducto(id: string | number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/productos/EliminarporId/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // =========================
  // AUXILIARES
  // =========================

  obtenerCategorias(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/auxiliares/categorias/todas`
    );
  }

  obtenerMarcas(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/auxiliares/marcas/todas`
    );
  }

  obtenerProveedores(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/auxiliares/proveedores/todos`
    );
  }

  obtenerEstadosProducto(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/auxiliares/estados-producto/todos`
    );
  }

  // =========================
  // CARRITO
  // =========================

  agregarAlCarrito(productoId: string | number, cantidad: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/carrito/agregar`,
      {
        ProductoID: productoId,
        Cantidad: cantidad
      },
      { headers: this.getHeaders() }
    );
  }

  obtenerCarritoPendiente(usuarioId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/carrito/usuario/${usuarioId}/pendientes`,
      { headers: this.getHeaders() }
    );
  }

  finalizarCompra(usuarioId: string, data: any = {}): Observable<any> {
  return this.http.put(
    `${this.apiUrl}/carrito/finalizar-compra/${usuarioId}`,
    data,
    { headers: this.getHeaders() }
  );
}

  obtenerPedidosActivos(usuarioId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/carrito/usuario/${usuarioId}/pedidos`,
      { headers: this.getHeaders() }
    );
  }

  obtenerHistorialPedidos(usuarioId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/carrito/usuario/${usuarioId}/historial`,
      { headers: this.getHeaders() }
    );
  }

  obtenerPedidosAdmin(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/carrito/admin/pedidos`,
      { headers: this.getHeaders() }
    );
  }

  avanzarEstadoPedido(carritoId: string | number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/carrito/avanzar-estado/${carritoId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  obtenerImagenesProducto(productoId: string | number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/imagenesProducto/producto/${productoId}`
    );
  }

  verificarFavorito(productoId: string | number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/favoritos/existe/${productoId}`,
      { headers: this.getHeaders() }
    );
  }

  obtenerFavoritosUsuario(usuarioId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/favoritos/usuario/${usuarioId}`,
      { headers: this.getHeaders() }
    );
  }

  agregarFavorito(productoId: string | number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/favoritos/agregar`,
      {
        ProductoID: productoId
      },
      { headers: this.getHeaders() }
    );
  }

  eliminarFavoritoPorProducto(productoId: string | number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/favoritos/producto/${productoId}`,
      { headers: this.getHeaders() }
    );
  }

  // =========================
  // ADMIN - IMÁGENES PRODUCTO
  // =========================

  agregarImagenProducto(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/imagenesProducto/agregar`,
      data,
      { headers: this.getHeaders() }
    );
  }

  marcarImagenPrincipal(idImagen: string | number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/imagenesProducto/principal/${idImagen}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  eliminarImagenProducto(idImagen: string | number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/imagenesProducto/eliminar/${idImagen}`,
      { headers: this.getHeaders() }
    );
  }

  obtenerOrdenesActivas(usuarioId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/ordenes/usuario/${usuarioId}/activas`,
      { headers: this.getHeaders() }
    );
  }

  obtenerHistorialOrdenes(usuarioId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/ordenes/usuario/${usuarioId}/historial`,
      { headers: this.getHeaders() }
    );
  }

  obtenerOrdenesAdmin(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/ordenes/admin/todas`,
      { headers: this.getHeaders() }
    );
  }

  avanzarEstadoOrdenAdmin(ordenId: string | number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/ordenes/admin/avanzar-estado/${ordenId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // =========================
  // ADMIN - AUXILIARES
  // =========================

  crearCategoria(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auxiliares/categorias`,
      data,
      { headers: this.getHeaders() }
    );
  }

  actualizarCategoria(id: string | number, data: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/auxiliares/categorias/${id}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  eliminarCategoria(id: string | number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/auxiliares/categorias/${id}`,
      { headers: this.getHeaders() }
    );
  }

  crearMarca(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auxiliares/marcas`,
      data,
      { headers: this.getHeaders() }
    );
  }

  actualizarMarca(id: string | number, data: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/auxiliares/marcas/${id}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  eliminarMarca(id: string | number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/auxiliares/marcas/${id}`,
      { headers: this.getHeaders() }
    );
  }

  crearProveedor(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auxiliares/proveedores`,
      data,
      { headers: this.getHeaders() }
    );
  }

  actualizarProveedor(id: string | number, data: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/auxiliares/proveedores/${id}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  eliminarProveedor(id: string | number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/auxiliares/proveedores/${id}`,
      { headers: this.getHeaders() }
    );
  }

}

