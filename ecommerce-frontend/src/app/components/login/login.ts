import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { StorageService } from '../../services/storage';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';

  constructor(
    private api: ApiService, 
    private auth: AuthService, 
    private router: Router,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('user_session');
    }
    this.storage.clearOnLogout();
    this.auth.logout();
  }

  onLogin(): void {
    if (!this.email || !this.password) {
      alert('Please fill out all credentials.');
      return;
    }

    const cleanEmail = this.email.trim().toLowerCase();

    this.api.signIn(cleanEmail, this.password).subscribe({
      next: (userData) => {
        console.log("Database Response Data: ", userData);
        this.handleNavigation(cleanEmail, userData);
      },
      error: (err) => {
        console.error("Intercepted Response Details:", err);
        
        if (err.status === 403) {
          const reason = err.error?.reason || 'Account suspended by administrator.';
          const adminMail = err.error?.adminContact || 'admin@gmail.com';
          alert(`🚫 YOUR ACCOUNT HAS BEEN BLOCKED BY THE ADMIN!\n\nReason: ${reason}\n\nPlease contact Admin at: ${adminMail}`);
          return;
        }

        alert('Invalid email or password configuration.');
      }
    });
  }

  handleNavigation(email: string, userData: any) {
    this.storage.clearOnLogout();
    this.auth.logout();

    const cleanEmail = email.trim().toLowerCase();
    const dbRole = userData?.role ? userData.role.toString().trim().toUpperCase() : 'USER';
    const deliveryPartnerName = userData?.deliveryPartner || null;

    // 🚚 CHECK DELIVERY PARTNER ASSIGNMENT FOR LOGISTICS ROLE
    if ((dbRole === 'DELIVERY' || dbRole === 'DELIVERY_PARTNER' || dbRole === 'COURIER') && !deliveryPartnerName) {
      alert('⚠️ ACCESS DENIED: Delivery Partner company name is not assigned to your account yet.\n\nPlease contact administrator or execute SQL update!');
      return;
    }

    const sessionUser = {
      id: userData?.id,
      name: deliveryPartnerName ? deliveryPartnerName : (userData?.name || 'Authenticated User'), // Uses partner name for delivery agent
      email: cleanEmail,
      role: dbRole,
      deliveryPartner: deliveryPartnerName
    };

    this.auth.setCurrentUser(sessionUser);

    console.log("🔒 Authenticated User Role from DB:", dbRole);
    console.log("🚚 Assigned Delivery Partner:", deliveryPartnerName);

    switch (dbRole) {
      case 'ADMIN':
        alert('Admin Login Success!');
        this.router.navigate(['/admin']);
        break;

      case 'DELIVERY':
      case 'DELIVERY_PARTNER':
      case 'COURIER':
        alert(`🚚 Delivery Partner Login Success! Welcome, ${deliveryPartnerName}`);
        this.router.navigate(['/delivery-portal']);
        break;

      case 'USER':
      default:
        alert('User Login Success!');
        this.router.navigate(['/']);
        break;
    }
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}