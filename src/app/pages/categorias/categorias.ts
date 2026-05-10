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
    // Te lleva al inventario y pasa la categoría como parámetro
    this.router.navigate(['/products'], { queryParams: { category: categoria } });
  }
}
