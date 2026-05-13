import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  mensaje?: string;
  token: string;
  usuarioId?: string;
  idUsuario?: string;
  nombre?: string;
  correo?: string;
  rol?: string;
  metodoLogin?: string;
  usuario?: {
    id?: string;
    _id?: string;
    nombre?: string;
    correo?: string;
    rol?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  login(correo: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/AutenticarUsuario`, {
      correo,
      password
    });
  }

  loginAdmin(correo: string, password: string): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${this.apiUrl}/usuarios/AutenticarAdministrador`, {
    correo,
    password
  });
}

  registrar(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/CrearUsuario`, usuario);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  cerrarSesion(): void {
    localStorage.clear();
  }

  loginGoogle(idToken: string): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(
    `${this.apiUrl}/usuarios/AutenticarGoogle`,
    {
      idToken
    }
  );
}
}