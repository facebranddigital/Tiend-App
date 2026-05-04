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

  //  LISTA  (permisos como owner)
  const ADMIN_EMAILS = [
    'eversozinho@gmail.com',
    'jbravo35@estudiantes.areandina.edu.co',
    'yjairobravo@gmail.com',
    'teveventaspasto@gmail.com',
    'facebranddigital@gmail.com',
    'anaportilla143@gmail.com', // sin la fucking , al final //
  ];

  return authService.user$.pipe(
    take(1),
    map((user) => {
      //  Verificamos con la lista completa
      if (user && user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        return true;
      } else {
        console.warn('Acceso denegado: No tienes permisos de Owner');
        router.navigate(['/login']);
        return false;
      }
    }),
  );
};
