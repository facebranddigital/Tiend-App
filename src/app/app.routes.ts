import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { ProductListComponent } from './pages/products/product-list/product-list';
import { ProductFormComponent } from './pages/products/product-form/product-form';
import { AdminFinanzasComponent } from './pages/products/admin-finanzas/admin-finanzas'; // 1. Importa el componente
import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';
import { CartComponent } from './pages/cart/cart';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
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
  // 2. Nueva ruta para la calculadora de rentabilidad
  {
    path: 'admin/finanzas',
    component: AdminFinanzasComponent,
    canActivate: [authGuard], // Solo los dueños de Bracasfood pueden ver esto
  },
  { path: 'cart', component: CartComponent },
  { path: '**', redirectTo: '' },
];
