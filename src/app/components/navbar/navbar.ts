import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  private router = inject(Router);

  isSearchActive = false;

  toggleSearch() {
    this.isSearchActive = !this.isSearchActive;
    if (this.isSearchActive) {
      // Enfoca el input automáticamente al abrir
      setTimeout(() => {
        const input = document.querySelector<HTMLElement>('.search-input');
        input?.focus();
      }, 300);
    }
  }

  // Buscador funcional
  onSearch(termino: string) {
    if (termino.trim().length > 0) {
      this.router.navigate(['/products'], { queryParams: { q: termino } });
      this.isSearchActive = false; // Cierra la barra tras buscar
    }
  }

  onLogout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
} // <--- Asegúrate de que esta llave cierre todo al final
