import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  authState,
  User,
  sendEmailVerification,
} from '@angular/fire/auth';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  user$: Observable<User | null> = authState(this.auth);

  private readonly ADMIN_EMAILS = [
    'eversozinho@gmail.com',
    'jbravo35@estudiantes.areandina.edu.co',
    'yjairobravo@gmail.com',
    'teveventaspasto@gmail.com',
    'anaportilla143@gmail.com',
    'facebranddigital@gmail.com',
  ];

  isAdmin$: Observable<boolean> = this.user$.pipe(
    map((user) => !!user && !!user.email && this.ADMIN_EMAILS.includes(user.email.toLowerCase())),
  );

  getCurrentUser() {
    return this.auth.currentUser;
  }

  // --- NUEVAS FUNCIONES PARA EL FLUJO BIOMÉTRICO ---

  /**
   * Recupera de forma síncrona el UID del usuario logueado en la sesión activa.
   * Útil para llamarlo inmediatamente antes de abrir el modal o tag de video.
   */
  obtenerUsuarioActualUid(): string | null {
    const usuario = this.auth.currentUser;
    return usuario ? usuario.uid : null;
  }

  /**
   * Recupera el UID de forma asíncrona esperando que el estado de Firebase se estabilice.
   * Ideal para validar intentos de sesión rápidos.
   */
  async obtenerUsuarioUidAsincrono(): Promise<string> {
    const usuarioActual = await firstValueFrom(this.user$);
    if (!usuarioActual) {
      throw new Error('No se detectó ninguna sesión activa en Firebase en este momento.');
    }
    return usuarioActual.uid;
  }

  // --- MÉTODOS DE AUTENTICACIÓN ORIGINALES PRESERVADOS ---

  async register(email: string, pass: string) {
    const credential = await createUserWithEmailAndPassword(this.auth, email, pass);

    if (credential.user) {
      await sendEmailVerification(credential.user);
      console.log('✅ Correo de verificación enviado desde Bracasfood');
    }

    return credential;
  }

  login(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  logout() {
    return signOut(this.auth);
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.user$.pipe(map((user) => !!user));
  }
}
