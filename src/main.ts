import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app'; // 👈 Cambiamos "App" por "AppComponent"

bootstrapApplication(App, appConfig) // 👈 Arrancamos con el nombre correcto
  .catch((err) => console.error(err));
