import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserSession } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); 
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // If executing on the server (SSR hydration), temporarily allow route pass-through to prevent pre-boot redirect
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const rawSession = sessionStorage.getItem('user_session') || localStorage.getItem('user_session');
  
  if (rawSession) {
    try {
      const user: UserSession = JSON.parse(rawSession);
      const role = (user?.role || '').toLowerCase().trim();
      const email = (user?.email || '').toLowerCase().trim();

      // Sync memory state
      authService.setCurrentUser(user);

      // Check admin permission
      if (state.url.includes('/admin') || route.routeConfig?.path === 'admin') {
        if (role === 'admin' || email === 'admin@gmail.com') {
          return true; 
        }
        alert('Access Denied. Admin clearance required.');
        router.navigate(['/']); 
        return false;
      }

      return true;
    } catch (e) {
      sessionStorage.removeItem('user_session');
      localStorage.removeItem('user_session');
    }
  }

  authService.redirectUrl = state.url;
  router.navigate(['/login']);
  return false;
};