import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { StorageService } from '../../services/storage';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css']
})
export class FavoritesComponent implements OnInit {

  public storage = inject(StorageService);
  public auth = inject(AuthService);
  private router = inject(Router);

  get currentTabUser() {
    return this.auth.getCurrentUser();
  }

  ngOnInit(): void {
    const activeUser = this.currentTabUser;
    if (activeUser) {
      this.storage.loadPermanentSession(activeUser.id);
    }
  }

  // Add item to Cart without deleting it from Favorites
  moveToCart(product: any): void {
    const activeUser = this.currentTabUser;
    if (!activeUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.storage.addToCart(product);

    const productName = product?.name || product?.productName || 'Selected Item';
    alert(`"${productName}" added to Shopping Cart! (Kept in Favorites)`);
  }
}