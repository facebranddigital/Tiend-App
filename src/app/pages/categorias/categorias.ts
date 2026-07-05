import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'; 
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, of } from 'rxjs';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.scss',
})
export class CategoriasComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService); 
  private destroyRef = inject(DestroyRef);

  // Variables dinámicas para textos predeterminados (Bracasfood)
  tituloPrincipal = 'Explora Bracasfood';
  
  tituloNarino = 'Sabores de Nariño';
  descNarino = 'Cuy Asado, Gallina y Tradición Pastusa';
  textoBotonNarino = 'Ver Platos';

  tituloSnacks = 'Pasabocas y Bebidas';
  descSnacks = 'Bolis Gourmet, Papitas y Tocineta BF';
  textoBotonSnacks = 'Ver Snacks';

  // Fondos predeterminados públicos de Bracasfood
  fondoNarino = '/assets/cuy1.webp';
  fondoSnacks = '/assets/bracasfoodbolis.webp';

  esPerfilEver = false;

  // 🎥 Control del reproductor de video flotante (Ever)
  mostrarModalVideo = false;
  rutaVideoEver = 'assets/video1.mp4'; 

  // 📸 Control del visualizador de foto flotante (Ever)
  mostrarModalFoto = false;
  rutaFotoEver = 'assets/ceschneider.jpg';

  ngOnInit() {
    // 🛠️ Buscamos dinámicamente sobre la sesión activa del usuario para evitar propiedades inexistentes
    const usuario$ = (this.authService as any).usuario$ ?? (this.authService as any).user$ ?? of(null);

    usuario$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((user: any) => !!user && !!user.email && user.email.toLowerCase() .startsWith('everso'))
      )
      .subscribe((isAdmin: boolean) => {
        this.esPerfilEver = isAdmin;

        if (this.esPerfilEver) {
          // 🔮 ENTORNO ADMINISTRADOR: C&E Schneider
          this.tituloPrincipal = 'C&E Schneider';
          
          this.tituloNarino = 'Galería de Videos';
          this.descNarino = 'Contenido audiovisual de nuestros proyectos de remodelación.';
          this.textoBotonNarino = 'VER VIDEOS 🎥'; 

          this.tituloSnacks = 'Registro Fotográfico';
          this.descSnacks = 'Evidencias y resultados de las obras ejecutadas.';
          this.textoBotonSnacks = 'VER FOTOS 📸'; 

          this.fondoNarino = 'assets/NUEVA_IMAGEN_NARINO.jpg';
          this.fondoSnacks = 'assets/NUEVA_IMAGEN_SNACKS.jpg';
        } else {
          // 🍔 ENTORNO PÚBLICO: Restaurante Bracasfood (Reset por defecto)
          this.tituloPrincipal = 'Explora Bracasfood';
          
          this.tituloNarino = 'Sabores de Nariño';
          this.descNarino = 'Cuy Asado, Gallina y Tradición Pastusa';
          this.textoBotonNarino = 'Ver Platos';

          this.tituloSnacks = 'Pasabocas y Bebidas';
          this.descSnacks = 'Bolis Gourmet, Papitas y Tocineta BF';
          this.textoBotonSnacks = 'Ver Snacks';

          this.fondoNarino = '/assets/cuy1.webp';
          this.fondoSnacks = '/assets/bracasfoodbolis.webp';
          
          this.mostrarModalVideo = false;
          this.mostrarModalFoto = false;
        }
      });
  }

  filtrarPor(categoria: string) {
    if (this.esPerfilEver) {
      if (categoria === 'tradicion') {
        this.mostrarModalVideo = true; 
      } else {
        this.mostrarModalFoto = true;  
      }
      return;
    }

    if (categoria === 'tradicion') {
      this.router.navigate(['/sabores-narino']);
    } else {
      this.router.navigate(['/'], { fragment: 'featured-products' });
    }
  }

  cerrarVideo() {
    this.mostrarModalVideo = false;
  }

  cerrarFoto() {
    this.mostrarModalFoto = false;
  }
}
