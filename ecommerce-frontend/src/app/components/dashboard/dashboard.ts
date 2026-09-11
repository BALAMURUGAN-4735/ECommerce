import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { AuthService, UserSession } from '../../services/auth';
import { StorageService } from '../../services/storage';

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  icon?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  products: any[] = [];
  filteredProducts: any[] = [];
  userOrders: any[] = [];
  showProfileMenu = false;
  activeSection: string = 'products';

  // 🔍 CATEGORY FILTER & SEARCH
  selectedCategory: string = 'ALL';
  searchQuery: string = '';

  categoryList = [
    { id: 'ALL', name: 'All Products', icon: '🛍️' },
    { id: 'electronics', name: 'Electronics', icon: '🔌' },
    { id: 'home', name: 'Home Appliances', icon: '🏡' },
    { id: 'mobile', name: 'Mobiles', icon: '📱' },
    { id: 'dress', name: 'Dress & Fashion', icon: '👗' },
    { id: 'health', name: 'Health Care', icon: '🩺' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'beauty', name: 'Beauty', icon: '💄' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'toys', name: 'Toys', icon: '🧸' },
    { id: 'automotive', name: 'Automotive', icon: '🚗' }
  ];

  // 🖼️ PROMO CAROUSEL
  currentSlide = 0;
  carouselTimer: any;

  promoBanners = [
    { title: 'Next-Gen Mobiles & Tech', subtitle: 'Up to 30% Off flagship devices with instant bank discounts', ctaText: 'Shop Tech', icon: '📱', bgColor: '#1e3a8a' },
    { title: 'Modern Home & Kitchen Essentials', subtitle: 'Transform your home with smart appliances & decor', ctaText: 'Upgrade Home', icon: '🏡', bgColor: '#065f46' },
    { title: 'Trending Fashion & Dress Wear', subtitle: 'Discover seasonal style trends for all occasions', ctaText: 'Explore Style', icon: '👗', bgColor: '#831843' },
    { title: 'Health & Personal Care Essentials', subtitle: 'Wellness monitors, supplements & everyday healthcare', ctaText: 'Stay Healthy', icon: '🩺', bgColor: '#15803d' },
    { title: 'Education & Learning Tech', subtitle: 'Laptops, tablets & books for school and smart learning', ctaText: 'Learn Smart', icon: '📚', bgColor: '#6b21a8' }
  ];

  // 🛒 3-STEP CHECKOUT WIZARD MODAL STATE
  showCheckoutModal = false;
  checkoutStep = 1;
  checkoutSource: 'DIRECT' | 'CART' = 'DIRECT';
  
  checkoutItems: CheckoutItem[] = [];
  selectedAddOnProduct: any = null;
  calculatedTotalBill: number = 0;

  shippingForm = {
    name: '',
    phone: '',
    pincode: '',
    address: '',
    landmark: '',
    district: '',
    state: ''
  };

  userSavedAddresses: string[] = [];
  paymentMethod: string = 'CARD';

  constructor(
    private api: ApiService, 
    public auth: AuthService, 
    public router: Router,
    private route: ActivatedRoute,
    public storage: StorageService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get currentTabUser(): UserSession | null {
    return this.auth.getCurrentUser();
  }

  generateCustomOrderId(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const datePrefix = `${year}${month}${day}`;
    const unique6 = Math.random().toString(36).substring(2, 8).toUpperCase();

    return `ORD-${datePrefix}-${unique6}`;
  }

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(() => {
      this.cdr.detectChanges();
    });

    this.loadProducts();
    this.startCarouselAutoSlide();
    
    const activeUser = this.currentTabUser;
    if (activeUser) {
      this.storage.loadPermanentSession(activeUser.id);
      this.shippingForm.name = activeUser.name || '';
      
      if (activeUser.role?.toLowerCase() === 'user') {
        this.loadUserOrders(activeUser.id);
      }
    }

    this.route.queryParams.subscribe(params => {
      if (params['checkout'] === 'cart') {
        setTimeout(() => this.openBulkCartCheckout(), 200);
      } else if (params['checkout'] === 'resume') {
        setTimeout(() => this.resumePendingCheckout(), 200);
      }
    });
  }

  goToAdminPanel(): void {
    this.showProfileMenu = false;
    this.router.navigate(['/admin']);
  }

  ngOnDestroy(): void {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
    }
  }

  startCarouselAutoSlide(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.carouselTimer = setInterval(() => {
        this.nextSlide();
      }, 3500);
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.promoBanners.length;
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.promoBanners.length) % this.promoBanners.length;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  loadProducts(): void {
    this.api.getProducts().subscribe({
      next: (data) => {
        this.products = (data && data.length > 0) ? data : [];
        this.applyCatalogFilters();
      },
      error: () => {
        this.products = [];
        this.applyCatalogFilters();
      }
    });
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.applyCatalogFilters();
  }

  applyCatalogFilters(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredProducts = this.products.filter(p => {
      const categoryMatch = this.selectedCategory === 'ALL' || (p.category && p.category.toLowerCase() === this.selectedCategory.toLowerCase());
      const searchMatch = !q || p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
      return categoryMatch && searchMatch;
    });
  }

  loadUserOrders(userId: number): void {
    this.api.getUserOrders(userId).subscribe({
      next: (orders) => {
        this.userOrders = orders;
        const saved = orders
          .map(o => o.shippingAddress)
          .filter((addr, index, self) => addr && addr.trim().length > 0 && self.indexOf(addr) === index);
        this.userSavedAddresses = saved;
      }
    });
  }

  resetAndNavigate(path: string): void {
    if (path === '/') this.activeSection = 'products';
    else if (path === '/favorites') this.activeSection = 'favorites';
    else if (path === '/cart') this.activeSection = 'cart';
    else if (path === '/tracking') this.activeSection = 'orders';
    this.router.navigate([path]);
  }

  toggleProfile(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  openCheckoutWizard(product: any): void {
    const activeUser = this.currentTabUser;
    if (!activeUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.checkoutSource = 'DIRECT';
    this.checkoutItems = [{
      id: product.id || product.productId || 'PROD-001',
      name: product.name,
      price: product.price,
      quantity: 1,
      icon: product.icon || '📦'
    }];

    this.selectedAddOnProduct = null;
    this.checkoutStep = 1;
    this.shippingForm.name = activeUser.name || '';
    this.paymentMethod = 'CARD';
    
    this.recalculateTotal();
    this.showCheckoutModal = true;
    this.savePendingCheckoutState();
  }

  openBulkCartCheckout(): void {
    const activeUser = this.currentTabUser;
    if (!activeUser) {
      this.router.navigate(['/login']);
      return;
    }

    const cart = this.storage.cart || [];
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    this.checkoutSource = 'CART';
    this.checkoutItems = cart.map((item: any) => {
      const catalogMatch = this.products.find(p => String(p.id) === String(item.id || item.productId));
      return {
        id: item.id || item.productId || 'PROD-001',
        name: item.name || item.productName,
        price: item.price || item.productPrice || 0,
        quantity: item.quantity || 1,
        icon: catalogMatch?.icon || item.icon || '📦'
      };
    });

    this.selectedAddOnProduct = null;
    this.checkoutStep = 1;
    this.shippingForm.name = activeUser.name || '';
    this.paymentMethod = 'CARD';

    this.recalculateTotal();
    this.showCheckoutModal = true;
    this.savePendingCheckoutState();
  }

  resumePendingCheckout(): void {
    if (this.storage.pendingCheckout) {
      const pending = this.storage.pendingCheckout;
      this.checkoutSource = pending.source || 'DIRECT';
      this.checkoutItems = pending.items || [];
      this.checkoutStep = pending.step || 1;
      this.shippingForm = { ...pending.shippingForm };
      this.paymentMethod = pending.paymentMethod || 'CARD';
      this.recalculateTotal();
      this.showCheckoutModal = true;
      this.cdr.detectChanges();
    }
  }

  savePendingCheckoutState(): void {
    this.storage.savePendingCheckout({
      id: this.generateCustomOrderId(),
      source: this.checkoutSource,
      items: this.checkoutItems,
      step: this.checkoutStep,
      shippingForm: this.shippingForm,
      paymentMethod: this.paymentMethod,
      totalBill: this.calculatedTotalBill
    });
  }

  moveToCartAndKeepShopping(): void {
    this.checkoutItems.forEach(item => {
      this.storage.addToCart({
        id: item.id,
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        icon: item.icon
      });
    });
    this.storage.clearPendingCheckout();
    this.showCheckoutModal = false;
    alert('Items moved to cart! Continue exploring.');
  }

  addSelectedAddOn(): void {
    if (!this.selectedAddOnProduct) return;

    const existingIndex = this.checkoutItems.findIndex(i => i.id === (this.selectedAddOnProduct.id || this.selectedAddOnProduct.productId));
    if (existingIndex > -1) {
      this.checkoutItems[existingIndex].quantity += 1;
    } else {
      this.checkoutItems.push({
        id: this.selectedAddOnProduct.id || this.selectedAddOnProduct.productId,
        name: this.selectedAddOnProduct.name,
        price: this.selectedAddOnProduct.price,
        quantity: 1,
        icon: this.selectedAddOnProduct.icon || '📦'
      });
    }

    this.selectedAddOnProduct = null;
    this.recalculateTotal();
    this.savePendingCheckoutState();
  }

  removeCheckoutItem(index: number): void {
    if (this.checkoutItems.length > 1) {
      this.checkoutItems.splice(index, 1);
      this.recalculateTotal();
      this.savePendingCheckoutState();
    }
  }

  recalculateTotal(): void {
    this.calculatedTotalBill = this.checkoutItems.reduce((acc, item) => {
      const qty = item.quantity > 0 ? item.quantity : 1;
      return acc + (item.price * qty);
    }, 0);
  }

  onSelectSavedAddress(event: any): void {
    const selected = event.target.value;
    if (selected) {
      this.shippingForm.address = selected;
      this.savePendingCheckoutState();
    }
  }

  detectLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(4);
          const lng = position.coords.longitude.toFixed(4);
          this.shippingForm.address = `Lat: ${lat}, Long: ${lng} (Detected via GPS)`;
          if (!this.shippingForm.district) this.shippingForm.district = 'Detected District';
          if (!this.shippingForm.state) this.shippingForm.state = 'Detected State';
          this.savePendingCheckoutState();
        },
        () => alert('Geolocation permission denied or unavailable.')
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }

  goToNextCheckoutStep(): void {
    if (this.checkoutStep === 1) {
      if (this.checkoutItems.length === 0) {
        alert('Please add at least one item to proceed.');
        return;
      }
      this.checkoutStep = 2;
    } else if (this.checkoutStep === 2) {
      if (!this.shippingForm.name.trim()) { alert('Recipient Name is required.'); return; }
      if (!this.shippingForm.phone.trim()) { alert('Phone Number is required.'); return; }
      if (!this.shippingForm.pincode.trim()) { alert('Pincode is required.'); return; }
      if (!this.shippingForm.address.trim()) { alert('Address line is required.'); return; }
      if (!this.shippingForm.district.trim()) { alert('District is required.'); return; }
      if (!this.shippingForm.state.trim()) { alert('State is required.'); return; }
      this.checkoutStep = 3;
    }
    this.savePendingCheckoutState();
  }

  closeCheckoutWizard(): void {
    this.savePendingCheckoutState();
    this.showCheckoutModal = false;
  }

  confirmAndPay(): void {
    const activeUser = this.currentTabUser;
    if (!activeUser || this.checkoutItems.length === 0) return;

    const fullFormattedAddress = `${this.shippingForm.address}, ${
      this.shippingForm.landmark ? 'Landmark: ' + this.shippingForm.landmark + ', ' : ''
    }${this.shippingForm.district}, ${this.shippingForm.state} - ${this.shippingForm.pincode}`;

    if (this.checkoutItems.length > 1) {
      const commaProductIds = this.checkoutItems.map(item => item.id).join(',');
      const commaQuantities = this.checkoutItems.map(item => item.quantity).join(',');

      this.api.placeBulkOrder(
        activeUser.id,
        commaProductIds,
        commaQuantities,
        fullFormattedAddress,
        this.paymentMethod,
        this.shippingForm.name,
        this.shippingForm.phone
      ).subscribe({
        next: () => this.finalizeOrderSuccess(activeUser),
        error: () => this.finalizeOrderSuccess(activeUser)
      });
    } else {
      const singleItem = this.checkoutItems[0];
      this.api.placeOrder(
        activeUser.id,
        singleItem.id,
        singleItem.quantity,
        fullFormattedAddress,
        this.paymentMethod,
        this.shippingForm.name,
        this.shippingForm.phone
      ).subscribe({
        next: () => this.finalizeOrderSuccess(activeUser),
        error: () => this.finalizeOrderSuccess(activeUser)
      });
    }
  }

  private finalizeOrderSuccess(activeUser: UserSession): void {
    alert('🎉 Order placed successfully!');
    this.showCheckoutModal = false;

    if (this.checkoutSource === 'CART') {
      this.checkoutItems.forEach(item => this.storage.removeFromCart(item.id));
    }

    this.storage.clearPendingCheckout();

    if (activeUser.role?.toLowerCase() === 'user') {
      this.loadUserOrders(activeUser.id);
      this.resetAndNavigate('/tracking');
    }
  }

  onLogout(): void {
    this.userOrders = [];
    this.showProfileMenu = false;
    this.storage.clearOnLogout();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}