import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface UserSession {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private currentUserSubject = new BehaviorSubject<UserSession | null>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();
  public redirectUrl: string | null = null; 

  constructor() {
    this.refreshSession();
  }

  public refreshSession(): void {
    const user = this.getCurrentUser();
    this.currentUserSubject.next(user);
  }

  // 🟢 TAB-ISOLATED SESSION MANAGEMENT
  setCurrentUser(user: UserSession | null): void {
    if (isPlatformBrowser(this.platformId)) {
      if (user) {
        // Use sessionStorage only so each browser tab manages its own logged-in user
        sessionStorage.setItem('user_session', JSON.stringify(user));
      } else {
        sessionStorage.removeItem('user_session');
      }
    }
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): UserSession | null {
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = sessionStorage.getItem('user_session');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    const role = (user.role || '').toLowerCase().trim();
    const email = (user.email || '').toLowerCase().trim();
    return role === 'admin' || email === 'admin@gmail.com';
  }

  logout(): void {
    this.setCurrentUser(null);
    this.redirectUrl = null;
  }
}