import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  obtenerUsuarioPorId(usuarioId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/usuarios/ObtenerUsuarioPorId/${usuarioId}`,
      { headers: this.getHeaders() }
    );
  }

  actualizarUsuario(usuario: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/usuarios/ActualizarUsuario`,
      usuario,
      { headers: this.getHeaders() }
    );
  }

  cambiarPassword(data: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/usuarios/CambiarPassword`,
      data,
      { headers: this.getHeaders() }
    );
  }

  obtenerUsuarios(): Observable<any> {
  return this.http.get(
    `${this.apiUrl}/usuarios/ObtenerTodos`,
    { headers: this.getHeaders() }
  );
}

actualizarUsuarioAdmin(usuario: any): Observable<any> {
  return this.http.put(
    `${this.apiUrl}/usuarios/ActualizarUsuario`,
    usuario,
    { headers: this.getHeaders() }
  );
}
}