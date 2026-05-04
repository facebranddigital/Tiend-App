import { Component, inject } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { map, filter, startWith } from 'rxjs/operators'; // Agregamos startWith
import { Observable } from 'rxjs';

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

  // 1. LISTA DE OWNERS (Mantenela siempre actualizada aquí)
  private readonly ADMIN_EMAILS: string[] = [
    'teveventaspasto@gmail.com',
    'eversozinho@gmail.com',
    'facebranddigital@gmail.com',
    'anaportilla143@gmail.com',
    'jbravo35@estudiantes.areandina.edu.co',
    'yjairobravo@gmail.com',
  ];

  // 2. VALIDACIÓN DE ADMIN (Para mostrar/ocultar botones)
  public isAdmin$: Observable<boolean> = this.authService.user$.pipe(
    map((user) => !!user?.email && this.ADMIN_EMAILS.includes(user.email.toLowerCase())),
  );

   // 3. DISPARADOR INTELIGENTE (Inspirado en el botón de Inicio)
  logoLink$: Observable<string> = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(null),
    map(() => {
      const user = this.authService.getCurrentUser();
      const email = user?.email?.toLowerCase();
      const isAdmin = email && this.ADMIN_EMAILS.includes(email);

      // Si NO es admin, siempre a la Landing
      if (!isAdmin) return '/';

      const url = this.router.url;
      const isAtCalculadora = url.includes('/admin/finanzas');
      const isAtInventario = url.includes('/products');

      // LÓGICA DE RETROCESO:
      if (isAtCalculadora) return '/products'; // De Calculadora al Inventario
      
      // SI ESTÁ EN INVENTARIO: Usamos la lógica del botón de Inicio que viste
      if (isAtInventario) return '/'; 

      // Si está en la Landing: Entra al Inventario
      return '/products';
    }),
  );

  isSearchActive = false;

  toggleSearch(): void {
    this.isSearchActive = !this.isSearchActive;
    if (this.isSearchActive) {
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('.search-input');
        input?.focus();
      }, 100);
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
