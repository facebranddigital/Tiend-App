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
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'sabores-narino', component: SaboresNarinoComponent },
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

  // RUTA DEL SEGUIMIENTO EN VIVO DEL CLIENTE
  { path: 'seguimiento/:id', component: SeguimientoComponent },

  // RUTA DE PERFIL PROTEGIDA CON TU GUARD DE AUTENTICACIÓN
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [authGuard],
  },

  // ✅ 4. NUEVA RUTA SECRETA DEL PANEL DE CONTROL DEL REPARTIDOR
  {
    path: 'admin/repartidor/:id',
    component: AdminRepartidorComponent,
  },

  // Redirección por defecto si la URL no existe (Debe ir siempre al final)
  { path: '**', redirectTo: '' },
];
