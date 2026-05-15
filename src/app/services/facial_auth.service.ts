import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FacialAuthService {
  private apiUrl = 'http://localhost:8000/api/user';

  constructor(private http: HttpClient) {}

  registrarRostro(usuarioId: string, imagenBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('file', imagenBlob, 'registro.jpg');
    formData.append('usuario_id', usuarioId);
    return this.http.post(`${this.apiUrl}/register-face`, formData);
  }

  verificarRostro(usuarioId: string, imagenBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('file', imagenBlob, 'verificacion.jpg');
    formData.append('usuario_id', usuarioId);
    return this.http.post(`${this.apiUrl}/verify-face`, formData);
  }
}
