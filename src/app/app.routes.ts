import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { ProductListComponent } from './pages/products/product-list/product-list';
import { ProductFormComponent } from './pages/products/product-form/product-form';
import { AdminFinanzasComponent } from './pages/products/admin-finanzas/admin-finanzas';
import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';
import { CartComponent } from './pages/cart/cart';
import { authGuard } from './guards/auth.guard';
// 1. IMPORTA EL NUEVO COMPONENTE
import { CategoriasComponent } from './pages/categorias/categorias';
import { SaboresNarinoComponent } from './pages/sabores-narino/sabores-narino';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'sabores-narino', component: SaboresNarinoComponent },
  // 2. AGREGA LA RUTA DE CATEGORÍAS
  { path: 'categorias', component: CategoriasComponent },

  {
    path: 'products',
    component: ProductListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'products/new',
    component: ProductFormComponent,
    canActivate: [authGuard],
  },
  {
    path: 'products/edit/:id',
    component: ProductFormComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin/finanzas',
    component: AdminFinanzasComponent,
    canActivate: [authGuard],
  },
  { path: 'cart', component: CartComponent },
  { path: '**', redirectTo: '' },
];
