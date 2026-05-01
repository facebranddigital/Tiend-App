import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { map } from 'rxjs/operators';

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

  // 1. Definimos los correos autorizados (Estilo Admin Panel)
  private readonly ADMIN_EMAILS = [
    'teveventaspasto@gmail.com',
    'eversozinho@gmail.com',
    'facebranddigital@gmail.com',
  ];

  // 2. Creamos un Observable que valide si el usuario es Owner
  public isAdmin$ = this.authService.user$.pipe(
    map((user) => !!user && !!user.email && this.ADMIN_EMAILS.includes(user.email)),
  );

  isSearchActive = false;

  toggleSearch() {
    this.isSearchActive = !this.isSearchActive;
    if (this.isSearchActive) {
      setTimeout(() => {
        const input = document.querySelector<HTMLElement>('.search-input');
        input?.focus();
      }, 300);
    }
  }

  onSearch(termino: string) {
    if (termino.trim().length > 0) {
      this.router.navigate(['/products'], { queryParams: { q: termino } });
      this.isSearchActive = false;
    }
  }

  onLogout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
