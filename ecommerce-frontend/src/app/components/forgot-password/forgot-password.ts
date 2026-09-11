import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent {
  email: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private api: ApiService, private router: Router) {}

  onResetPassword(): void {
    if (!this.email || !this.newPassword || !this.confirmPassword) {
      alert('All fields are required.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('New Password and Confirm Password do not match!');
      return;
    }

    this.api.resetPassword(this.email, this.newPassword).subscribe({
      next: (res: any) => {
        alert(res?.message || 'Password successfully updated in database!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        // 🟢 Robust message extraction to fix [object Object] alert
        const msg = err.error?.message || (typeof err.error === 'string' ? err.error : 'Failed to update password. Check if Email ID exists.');
        alert(msg);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}