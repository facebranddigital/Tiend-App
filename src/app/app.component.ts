import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // Requerido para usar *ngIf
import { SeguimientoComponent } from './components/seguimiento/seguimiento';

// Asegúrate de importar aquí tu Navbar y Footer si son Standalone también
// import { NavbarComponent } from './components/navbar/navbar.component';
// import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SeguimientoComponent,
    // NavbarComponent, // Descoméntalos si Angular te tira error por no encontrarlos
    // FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.scss',
})
export class AppComponent implements OnInit {
  title = 'Bracasfood';

  // Variable que controla si se muestra la pantalla naranja al inicio
  public cargando: boolean = true;

  ngOnInit() {
    // Apaga la animación de carga después de 1.5 segundos
    setTimeout(() => {
      this.cargando = false;
      console.log('¡Bracasfood listo y cargado!');
    }, 1500);
  }
}
