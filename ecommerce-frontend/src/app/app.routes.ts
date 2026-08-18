import { Routes } from '@angular/router';
import { SignupComponent } from './components/signup/signup';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { TrackingComponent } from './components/tracking/tracking';
import { AdminComponent } from './components/admin/admin';
import { CartComponent } from './components/cart/cart';
import { FavoritesComponent } from './components/favorites/favorites';
import { authGuard } from './guards/auth.can-activate';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password';
import { DeliveryPortalComponent } from './components/delivery-portal/delivery-portal';

export const routes: Routes = [
  // Open Public Channels
  { path: '', component: DashboardComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'cart', component: CartComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'delivery-portal', component: DeliveryPortalComponent },
  
  // Guarded Client Channels
  { path: 'tracking', component: TrackingComponent, canActivate: [authGuard] },
  
  // Backoffice Admin Console
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },

  // Automatic Fallback Root Redirect
  { path: '**', redirectTo: '' }
];