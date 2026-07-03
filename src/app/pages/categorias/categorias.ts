import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.scss',
})
export class CategoriasComponent implements OnInit {
  private router = inject(Router);

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
    const correoLogueado = 'eversozinho@gmail.com'; 

    if (correoLogueado === 'eversozinho@gmail.com') {
      this.esPerfilEver = true;
      
      this.tituloPrincipal = 'C&E Schneider';
      
      // Ajustes Sección 1 (Videos de Remodelación)
      this.tituloNarino = 'Galería de Videos';
      this.descNarino = 'Contenido audiovisual de nuestros proyectos de remodelación.';
      this.textoBotonNarino = 'VER VIDEOS 🎥'; 

      // Ajustes Sección 2 (Fotos de Remodelación)
      this.tituloSnacks = 'Registro Fotográfico';
      this.descSnacks = 'Evidencias y resultados de las obras ejecutadas.';
      this.textoBotonSnacks = 'VER FOTOS 📸'; 

      // Imágenes de fondo exclusivas para el entorno de Ever
      this.fondoNarino = 'assets/NUEVA_IMAGEN_NARINO.jpg';
      this.fondoSnacks = 'assets/NUEVA_IMAGEN_SNACKS.jpg';
    }
  }

  filtrarPor(categoria: string) {
    // Intercepción exclusiva para el perfil de Ever (Modales flotantes)
    if (this.esPerfilEver) {
      if (categoria === 'tradicion') {
        this.mostrarModalVideo = true; 
      } else {
        this.mostrarModalFoto = true;  
      }
      return;
    }

    // Flujo normal de Bracasfood si no es Ever
    if (categoria === 'tradicion') {
      this.router.navigate(['/sabores-narino']);
    } else {
      this.router.navigate(['/'], { fragment: 'featured-products' });
    }
  }

  // Métodos de cierre de modales
  cerrarVideo() {
    this.mostrarModalVideo = false;
  }

  cerrarFoto() {
    this.mostrarModalFoto = false;
  }
}
