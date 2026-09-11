import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit {

  constructor(
    public storage: StorageService,
    public auth: AuthService,
    private router: Router
  ) {}

  get currentTabUser() {
    return this.auth.getCurrentUser();
  }

  get totalCartPrice(): number {
    if (!this.storage.cart || this.storage.cart.length === 0) return 0;
    return this.storage.cart.reduce((total, item) => {
      const price = item.price || item.productPrice || 0;
      const quantity = item.quantity > 0 ? item.quantity : 1;
      return total + (price * quantity);
    }, 0);
  }

  ngOnInit(): void {
    const activeUser = this.currentTabUser;
    if (activeUser) {
      this.storage.loadPermanentSession(activeUser.id);
    }
  }

  onQuantityChange(productId: string, newQuantity: number): void {
    if (newQuantity < 1) return;
    this.storage.updateCartQuantity(productId, newQuantity);
  }

  onRemove(productId: string): void {
    this.storage.removeFromCart(productId);
  }

  openBulkCheckoutWizard(): void {
    const activeUser = this.currentTabUser;
    if (!activeUser) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.storage.cart || this.storage.cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // Redirect to home dashboard with checkout trigger
    this.router.navigate(['/'], { queryParams: { checkout: 'cart' } });
  }

  resumePendingOrder(): void {
    this.router.navigate(['/'], { queryParams: { checkout: 'resume' } });
  }

  cancelPendingDraft(): void {
    this.storage.clearPendingCheckout();
  }
}