import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

// 1. Importamos los componentes apuntando a tus carpetas nativas
import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';

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

  ngOnInit() {
    setTimeout(() => {
      this.cargando = false;
      console.log('¡Bracasfood listo y cargado!');
    }, 1500);
  }
}
