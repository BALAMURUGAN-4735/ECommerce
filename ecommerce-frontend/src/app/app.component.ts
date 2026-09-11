import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  protected readonly title = signal('ecommerce-frontend');

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    // 🟢 Instantly wake up the tab's session state on F5 refresh
    this.auth.refreshSession();
  }
}