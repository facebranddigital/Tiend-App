import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // CORRECCIÓN EXACTA: Se cambia firebaseConfig por firebase
    provideFirebaseApp(() =>
      initializeApp((environment as any).firebaseConfig || (environment as any).firebase),
    ),
    provideAuth(() => getAuth()),
  ],
};
