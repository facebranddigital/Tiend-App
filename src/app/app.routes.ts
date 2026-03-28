import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { ProductListComponent } from './pages/products/product-list/product-list';
import { ProductFormComponent } from './pages/products/product-form/product-form';
import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'products', 
    component: ProductListComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'products/new', 
    component: ProductFormComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'products/edit/:id', 
    component: ProductFormComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' }
];
