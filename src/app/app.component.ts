import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

// 1. Importamos los componentes apuntando a tus carpetas nativas
import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';

// 🌟 IMPORTANTE: Importa tu servicio de autenticación (Ajusta la ruta si es necesario)
import { AuthService } from './services/auth.service'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent, // 2. Registramos el Navbar para habilitar <app-navbar>
    FooterComponent, // 3. Registramos el Footer para habilitar <app-footer>
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.scss', // Mantenemos tu hoja de estilo original
})
export class AppComponent implements OnInit {
  title = 'Bracasfood';

  public cargando: boolean = true;

  // 🌟 Inyectamos el AuthService en el constructor
  constructor(private authService: AuthService) {}

  ngOnInit() {
    // 1. 🎬 CONTROL DEL SPLASH SCREEN DE VIDEO (5 segundos o al terminar)
    const splash = document.getElementById('splash-screen');
    const video = document.getElementById('splash-video') as HTMLVideoElement;

    const hideSplash = () => {
      if (splash && splash.style.display !== 'none') {
        splash.style.opacity = '0';
        setTimeout(() => {
          splash.style.display = 'none';
        }, 500);
      }
    };

    if (video) {
      video.play().catch(e => console.log('Autoplay prevenido:', e));
      video.onended = hideSplash;
    }

    // Temporizador de respaldo exacto a los 5 segundos (5000ms)
    setTimeout(hideSplash, 10000);

    // 2. 🌟 ESCUCHA GLOBAL DE USUARIO: Cambia el tema de toda la web según el email
    if (this.authService.user$) {
      this.authService.user$.subscribe(user => {
        if (user && (user.email?.includes('schneider') || user.email === 'tu-correo-admin@remodelaciones.com')) {
          document.body.classList.add('tema-schneider');
        } else {
          document.body.classList.remove('tema-schneider');
        }
      });
    }
  }
}
