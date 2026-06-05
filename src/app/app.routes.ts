import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { ProductListComponent } from './pages/products/product-list/product-list';
import { ProductFormComponent } from './pages/products/product-form/product-form';
import { AdminFinanzasComponent } from './pages/products/admin-finanzas/admin-finanzas';
import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';
import { CartComponent } from './pages/cart/cart';
import { authGuard } from './guards/auth.guard';
import { CategoriasComponent } from './pages/categorias/categorias';
import { SaboresNarinoComponent } from './pages/sabores-narino/sabores-narino';

// 1. IMPORTACIÓN DEL COMPONENTE DE SEGUIMIENTO (ESTILO STICKER PRO)
import { SeguimientoComponent } from './components/seguimiento/seguimiento.component';

// 2. IMPORTACIÓN DEL NUEVO COMPONENTE DE PERFIL
import { PerfilComponent } from './pages/perfil/perfil';

// ✅ 3. IMPORTACIÓN COMPLETA DEL SIMULADOR SECRETO DEL REPARTIDOR
import { AdminRepartidorComponent } from './pages/admin-repartidor/admin-repartidor';

export const routes: Routes = [
  { path: '', component: LandingComponent }, // Puedes dejar la landing directa
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'sabores-narino', component: SaboresNarinoComponent },
  { path: 'categorias', component: CategoriasComponent },

  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/product-list/product-list').then((m) => m.ProductListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'products/new',
    loadComponent: () =>
      import('./pages/products/product-form/product-form').then((m) => m.ProductFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'products/edit/:id',
    loadComponent: () =>
      import('./pages/products/product-form/product-form').then((m) => m.ProductFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin/finanzas',
    loadComponent: () =>
      import('./pages/products/admin-finanzas/admin-finanzas').then(
        (m) => m.AdminFinanzasComponent,
      ),
    canActivate: [authGuard],
  },
  { path: 'cart', component: CartComponent },

  {
    path: 'seguimiento/:id',
    loadComponent: () =>
      import('./components/seguimiento/seguimiento.component').then((m) => m.SeguimientoComponent),
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil').then((m) => m.PerfilComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin/repartidor/:id',
    loadComponent: () =>
      import('./pages/admin-repartidor/admin-repartidor').then((m) => m.AdminRepartidorComponent),
  },

  { path: '**', redirectTo: '' },
];
