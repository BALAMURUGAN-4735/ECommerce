import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';

  constructor(private api: ApiService, private router: Router) {}

  onSignup(): void {
    if (!this.name || !this.email || !this.password) {
      alert('Please fill out all onboarding fields.');
      return;
    }

    this.api.signUp(this.name, this.email, this.password).subscribe({
      next: () => {
        alert('Account Created Successfully! Redirecting to login page.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert('Signup failed. Network error or email already taken.');
        console.error(err);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}