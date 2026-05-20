import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
// 1. IMPORTA LOS MÓDULOS DE FIRESTORE
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
// ✅ IMPORTACIÓN EXTRA DE STORAGE: Oficial de Angular Fire
import { getStorage, provideStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    provideFirebaseApp(() =>
      initializeApp((environment as any).firebaseConfig || (environment as any).firebase),
    ),
    provideAuth(() => getAuth()),
    // 2. AGREGA EL PROVEEDOR AQUÍ ABAJO
    provideFirestore(() => getFirestore()),
    // ✅ 3. SOLUCIÓN DEFINITIVA: Registramos el proveedor de Storage para quitar el NullInjectorError
    provideStorage(() => getStorage()),
  ],
};
