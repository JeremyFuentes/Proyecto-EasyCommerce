import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MetodoPagoService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  obtenerMetodosPago(usuarioId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/metodosPago/usuario/${usuarioId}`,
      { headers: this.getHeaders() }
    );
  }

  agregarMetodoPago(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/metodosPago/agregar`,
      data,
      { headers: this.getHeaders() }
    );
  }

  eliminarMetodoPago(id: string | number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/metodosPago/eliminar/${id}`,
      { headers: this.getHeaders() }
    );
  }
}