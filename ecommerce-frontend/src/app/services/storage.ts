import { Injectable } from '@angular/core';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  cart: any[] = [];
  favorites: any[] = [];
  pendingCheckout: any = null; // Saves unfinished order wizard session

  private currentUserId: number | null = null;
  private catalogProducts: any[] = [];

  constructor(private api: ApiService) {
    this.preloadCatalog();
  }

  private preloadCatalog(): void {
    this.api.getProducts().subscribe({
      next: (products) => {
        if (products && products.length > 0) {
          this.catalogProducts = products;
        } else {
          this.catalogProducts = this.getFallbackCatalog();
        }
      },
      error: () => {
        this.catalogProducts = this.getFallbackCatalog();
      }
    });
  }

  private getFallbackCatalog(): any[] {
    return [
      { id: 'PROD-001', productId: 'PROD-001', name: 'Premium Wireless Headphones', category: 'electronics', icon: '🎧', description: 'Noise-canceling over-ear headphones.', price: 299.99 },
      { id: 'PROD-002', productId: 'PROD-002', name: 'Ergonomic Mechanical Keyboard', category: 'electronics', icon: '⌨️', description: 'Tactile hot-swappable switches.', price: 149.50 },
      { id: 'PROD-003', productId: 'PROD-003', name: 'UltraWide Curved Gaming Monitor', category: 'electronics', icon: '🖥️', description: '34-inch 144Hz curved display panel.', price: 450.00 },
      { id: 'PROD-004', productId: 'PROD-004', name: 'Pro Smartphone 5G', category: 'mobile', icon: '📱', description: '6.7-inch OLED, 108MP Triple Camera.', price: 899.00 }
    ];
  }

  loadPermanentSession(userId: number): void {
    this.currentUserId = userId;

    // 🟢 CRUCIAL FIX: Clear memory cache so previous user's data isn't preserved
    this.cart = [];
    this.favorites = [];

    this.api.getPermanentItems(userId, 'CART').subscribe({
      next: (backendItems) => {
        if (backendItems) {
          this.cart = backendItems.map(item => this.hydrateItemDetails(item));
        }
      },
      error: (err) => console.error('Failed to load backend cart:', err)
    });

    this.api.getPermanentItems(userId, 'FAVORITE').subscribe({
      next: (backendItems) => {
        if (backendItems) {
          this.favorites = backendItems.map(item => this.hydrateItemDetails(item));
        }
      },
      error: (err) => console.error('Failed to load backend favorites:', err)
    });
  }

  private hydrateItemDetails(item: any): any {
    const targetId = item.productId || item.id;
    const catalogMatch = this.catalogProducts.find(
      p => p.id === targetId || p.productId === targetId
    );

    return {
      ...item,
      id: targetId,
      productId: targetId,
      name: item.name || item.productName || catalogMatch?.name || 'Selected Item',
      price: item.price || item.productPrice || catalogMatch?.price || 0,
      description: item.description || catalogMatch?.description || 'No description available',
      icon: item.icon || catalogMatch?.icon || '📦',
      category: item.category || catalogMatch?.category || 'General',
      quantity: item.quantity || 1
    };
  }

  addToCart(product: any): void {
    const pId = product.productId || product.id;
    const existing = this.cart.find(i => (i.productId || i.id) === pId);
    let qty = 1;

    if (existing) {
      existing.quantity += 1;
      qty = existing.quantity;
    } else {
      this.cart.push(this.hydrateItemDetails({ ...product, productId: pId, quantity: 1 }));
    }

    if (this.currentUserId) {
      this.api.syncPermanentItem(this.currentUserId, pId, qty, 'CART').subscribe({
        next: () => this.loadPermanentSession(this.currentUserId!)
      });
    }
    alert(`"${product.name || 'Item'}" added to Shopping Cart!`);
  }

  addToCartFromFavorites(product: any): void {
    this.addToCart(product);
  }

  removeFromCart(productId: string): void {
    this.cart = this.cart.filter(item => (item.productId || item.id) !== productId);

    if (this.currentUserId) {
      this.api.removePermanentItem(this.currentUserId, productId, 'CART').subscribe({
        next: () => this.loadPermanentSession(this.currentUserId!)
      });
    }
  }

  updateCartQuantity(productId: string, quantity: number): void {
    const existing = this.cart.find(item => (item.productId || item.id) === productId);
    if (existing && quantity > 0) {
      existing.quantity = quantity;
      if (this.currentUserId) {
        this.api.syncPermanentItem(this.currentUserId, productId, quantity, 'CART').subscribe();
      }
    }
  }

  toggleFavorite(product: any): void {
    const pId = product.productId || product.id;
    const index = this.favorites.findIndex(item => (item.productId || item.id) === pId);

    if (index > -1) {
      this.removeFromFavorites(pId);
    } else {
      this.favorites.push(this.hydrateItemDetails({ ...product, productId: pId }));
      if (this.currentUserId) {
        this.api.syncPermanentItem(this.currentUserId, pId, 1, 'FAVORITE').subscribe({
          next: () => this.loadPermanentSession(this.currentUserId!)
        });
      }
    }
  }

  removeFromFavorites(productId: string): void {
    this.favorites = this.favorites.filter(item => (item.productId || item.id) !== productId);

    if (this.currentUserId) {
      this.api.removePermanentItem(this.currentUserId, productId, 'FAVORITE').subscribe({
        next: () => this.loadPermanentSession(this.currentUserId!)
      });
    }
  }

  isFavorite(product: any): boolean {
    if (!this.favorites) return false;
    const pId = product.productId || product.id;
    return this.favorites.some(item => (item.productId || item.id) === pId);
  }

  // Pending Order Draft Helpers
  savePendingCheckout(data: any): void {
    this.pendingCheckout = data;
  }

  clearPendingCheckout(): void {
    this.pendingCheckout = null;
  }

  clearOnLogout(): void {
    this.currentUserId = null;
    this.cart = [];
    this.favorites = [];
    this.pendingCheckout = null;
  }
}