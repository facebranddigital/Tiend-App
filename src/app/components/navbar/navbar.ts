import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  // Inyectamos los servicios (públicos para usarlos en el HTML)
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  private router = inject(Router);

  // 1. Lista de Owners autorizados
  private readonly ADMIN_EMAILS: string[] = [
    'teveventaspasto@gmail.com',
    'eversozinho@gmail.com',
    'facebranddigital@gmail.com',
    'anaportilla143@gmail.com',
    'jbravo35@estudiantes.areandina.edu.co',
    'yjairobravo@gmail.com',
  ];

  // 2. Validación de Admin (Observable para el *ngIf con pipe async)
  public isAdmin$: Observable<boolean> = this.authService.user$.pipe(
    map((user) => !!user?.email && this.ADMIN_EMAILS.includes(user.email)),
  );

  isSearchActive = false;

  toggleSearch(): void {
    this.isSearchActive = !this.isSearchActive;
    if (this.isSearchActive) {
      // Usamos el setTimeout para esperar a que el DOM renderice el input
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('.search-input');
        input?.focus();
      }, 100); // 100ms suele ser suficiente y más rápido
    }
  }

  onSearch(termino: string): void {
    const term = termino.trim();
    if (term.length > 0) {
      this.router.navigate(['/products'], { queryParams: { q: term } });
      this.isSearchActive = false;
    }
  }

  onLogout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
