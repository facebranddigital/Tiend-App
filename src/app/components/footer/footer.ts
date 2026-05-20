import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // 1. IMPORTACIÓN AGREGADA

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink], // 2. IMPORTACIÓN AGREGADA AQUÍ PARA HABILITAR EL ROUTERLINK
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent {}
