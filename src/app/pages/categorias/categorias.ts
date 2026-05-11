import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.scss',
})
export class CategoriasComponent {
  private router = inject(Router);

  filtrarPor(categoria: string) {
    if (categoria === 'tradicion') {
      this.router.navigate(['/sabores-narino']);
    } else {
      // En categorias.ts
      this.router.navigate(['/'], { fragment: 'featured-products' });
    }
  }
}
