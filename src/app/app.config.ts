import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // 1. REPARACIÓN MÁGICA: Habilitamos la detección de cambios nativa basada en Zone.js
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    // 2. Tu configuración híbrida indestructible que ya armamos para Firebase
    provideFirebaseApp(() => initializeApp((environment as any).firebaseConfig || (environment as any).firebase)),
    provideAuth(() => getAuth())
  ]
};
