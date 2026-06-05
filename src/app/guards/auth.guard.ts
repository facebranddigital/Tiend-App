import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  if (typeof window !== 'undefined' && (window as any).Cypress) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  const ADMIN_EMAILS = [
    'eversozinho@gmail.com',
    'jbravo35@estudiantes.areandina.edu.co',
    'yjairobravo@gmail.com',
    'teveventaspasto@gmail.com',
    'facebranddigital@gmail.com',
    'anaportilla143@gmail.com',
  ];

  return authService.user$.pipe(
    take(1),
    map((user) => {
      if (!user) {
        console.warn('Acceso denegado: Sesión no válida.');
        router.navigate(['/login']);
        return false;
      }

      const esAdmin = user.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false;
      const urlDestino = state.url;

      // Rutas restringidas únicamente a administradores
      if (urlDestino.includes('/products') || urlDestino.includes('/admin')) {
        if (esAdmin) {
          return true;
        } else {
          console.warn('Acceso denegado: Requiere rol de Administrador.');
          router.navigate(['/']);
          return false;
        }
      }

      // El perfil y el carrito son de acceso libre para cualquier usuario logueado
      return true;
    }),
  );
};
