import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/auth-portal/auth-portal.component').then(m => m.AuthPortalComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth-portal/auth-portal.component').then(m => m.AuthPortalComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/product-listing.component').then(m => m.ProductListingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./pages/products/product-details.component').then(m => m.ProductDetailsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent),
    canActivate: [authGuard]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [authGuard]
  },
  {
    path: 'vault',
    loadComponent: () => import('./pages/vault/vault.component').then(m => m.VaultComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'products'
  }
];

