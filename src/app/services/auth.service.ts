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
   * Registra un nuevo usuario en Firebase y dispara el correo de bienvenida
   */
  async register(email: string, pass: string) {
    // 1. Crea el usuario en la base de datos de Firebase
    const credential = await createUserWithEmailAndPassword(this.auth, email, pass);

    // 2. Disparador del correo (Trigger)
    // Solo si Firebase confirma que el usuario se creó correctamente
    if (credential.user) {
      fetch('/api/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      })
        .then(() => console.log('✅ Solicitud de correo enviada a Vercel API'))
        .catch((err) => console.error('❌ Error al conectar con la API de correos:', err));
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
