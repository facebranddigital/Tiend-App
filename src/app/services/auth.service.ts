import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  authState,
  User,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  user$: Observable<User | null> = authState(this.auth);

  /**
   * 1. LISTA DE ADMINS (Agregá aquí los correos que pueden usar la calculadora)
   */
  private readonly ADMIN_EMAILS = [
    'eversozinho@gmail.com',
    'jbravo35@estudiantes.areandina.edu.co',
    'yjairobravo@gmail.com', // Asegurate de poner el tuyo para probar
    'teveventaspasto@gmail.com',
    'facebranddigital@gmail.com',
    'anaportilla143@gmail.com',
  ];

  /**
   * 2. DETECTOR DE ADMIN (Esto es lo que habilita el inventario en toda la app)
   */
  isAdmin$: Observable<boolean> = this.user$.pipe(
    map((user) => !!user && !!user.email && this.ADMIN_EMAILS.includes(user.email.toLowerCase())),
  );

  async register(email: string, pass: string) {
    const credential = await createUserWithEmailAndPassword(this.auth, email, pass);

    if (credential.user) {
      fetch('/api/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      })
        .then(() => console.log('✅ Solicitud de correo enviada'))
        .catch((err) => console.error('❌ Error API:', err));
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
