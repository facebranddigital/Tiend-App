import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.scss',
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
