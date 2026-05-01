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

  // 1. Agrega aquí los correos de los Owners (Salesforce Admin style)
  const ADMIN_EMAILS = [
    'teveventaspasto@gmail.com',
    'facebranddigital@gmail.com',
    'eversozinho@gmail.com',
  ];

  return authService.user$.pipe(
    take(1),
    map((user) => {
      // 2. Verificamos si existe el usuario Y si su correo está en la lista
      if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
        return true;
      } else {
        // Si no es admin, lo mandamos al login o a una página de "No Autorizado"
        console.warn('Acceso denegado: No tienes permisos de Owner');
        router.navigate(['/login']);
        return false;
      }
    }),
  );
};
