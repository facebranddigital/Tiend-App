import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { map, filter, startWith } from 'rxjs/operators'; 
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  private router = inject(Router);

  private themeSubscription!: Subscription;

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

  // 🌟 CAMBIO CLAVE: Ahora el Navbar se entera globalmente si debe usar el tema morado/fucsia C&E Schneider
  public isCalculadoraAdminActive$: Observable<boolean> = this.isAdmin$;

  // 3. DISPARADOR INTELIGENTE DE ENLACE DEL LOGO
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
      
      // SI ESTÁ EN INVENTARIO: Retorna a la raíz
      if (isAtInventario) return '/'; 

      // Si está en la Landing: Entra al Inventario
      return '/products';
    }),
  );

  isSearchActive = false;

  // 🌟 INYECCIÓN GLOBAL AUTOMÁTICA DEL TEMA EN EL BODY
  ngOnInit(): void {
    this.themeSubscription = this.isCalculadoraAdminActive$.subscribe(isSchneiderAdmin => {
      if (isSchneiderAdmin) {
        document.body.classList.add('tema-schneider');
      } else {
        document.body.classList.remove('tema-schneider');
      }
    });
  }

  // Limpieza de memoria al destruir el componente
  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

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
      // 🌟 Nos aseguramos de retirar la clase al salir antes de redirigir
      document.body.classList.remove('tema-schneider');
      this.router.navigate(['/login']);
    });
  }
}
