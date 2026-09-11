import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  activeTab: string = 'overview';

  // Metrics
  totalRevenue: number = 0;
  totalOrdersCount: number = 0;
  activeOrdersCount: number = 0;
  totalRefundsProcessed: number = 0;

  // Real Database Collections
  adminProducts: any[] = [];
  filteredAdminProducts: any[] = [];
  lowStockProducts: any[] = [];
  ordersList: any[] = [];
  filteredOrders: any[] = [];
  
  refundList: any[] = [];
  filteredRefundList: any[] = []; 

  auditLogsList: any[] = [];
  filteredAuditLogsList: any[] = []; 

  userAccountsList: any[] = [];
  filteredUserAccountsList: any[] = [];

  // Filter Models
  prodSearch: string = '';
  prodCatFilter: string = 'ALL';
  cityFilter: string = '';
  orderStatusFilter: string = 'ALL';

  refundSearch: string = ''; 
  refundStatusFilter: string = 'ALL'; 

  userSearch: string = ''; 
  userStatusFilter: string = 'ALL'; 
  userRoleFilter: string = 'ALL'; // 🟢 ADDED: User Role Filter Model

  auditSearch: string = ''; 
  auditModuleFilter: string = 'ALL'; 

  // 🟢 ADMIN REFRESH TIMER HANDLE
  adminRefreshTimer: any;

  categoryList = [
    { id: 'electronics', name: 'Electronics' },
    { id: 'home', name: 'Home Appliances' },
    { id: 'mobile', name: 'Mobiles' },
    { id: 'dress', name: 'Dress & Fashion' },
    { id: 'health', name: 'Health Care' },
    { id: 'education', name: 'Education' }
  ];

  iconDropdownList = [
    { emoji: '🎧', label: 'Headphones' },
    { emoji: '📱', label: 'Mobile' },
    { emoji: '⌨️', label: 'Keyboard' },
    { emoji: '🖥️', label: 'Monitor / PC' },
    { emoji: '☕', label: 'Coffee / Kitchen' },
    { emoji: '👗', label: 'Dress / Fashion' },
    { emoji: '👟', label: 'Shoes / Sports' },
    { emoji: '🎮', label: 'Gaming' },
    { emoji: '📦', label: 'General Box' }
  ];

  // Modals Visibility
  showAddProductModal: boolean = false;
  showEditProductModal: boolean = false;
  showDistributionModal: boolean = false;
  showInvoiceModal: boolean = false;
  showItemsModal: boolean = false;

  // Models
  newProd = { name: '', category: 'electronics', price: 0, stockQuantity: 10, description: '', icon: '🎧' };
  editingProd: any = { id: '', name: '', category: 'electronics', price: 0, stockQuantity: 0, description: '', icon: '🎧' };
  
  selectedOrderForDispatch: any = null;
  dispatchPartner: string = 'BlueDart Express';
  dispatchStage: string = 'PACKING';
  
  cancelReasonSelection: string = 'Customer Requested Cancellation';
  customCancelReason: string = '';

  selectedInvoiceOrder: any = null;
  selectedOrderForItems: any = null;

  constructor(
    private api: ApiService, 
    public auth: AuthService, 
    public router: Router, 
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.auth.refreshSession();

    const currentUser = this.auth.getCurrentUser();
    if (!currentUser || (currentUser.role?.toLowerCase() !== 'admin' && currentUser.email !== 'admin@gmail.com')) {
      alert('Administrative clearance required.');
      this.router.navigate(['/login']);
      return;
    }

    this.loadAllLiveDatabaseData();

    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        this.adminRefreshTimer = setInterval(() => {
          this.ngZone.run(() => {
            this.loadAllLiveDatabaseDataSilent();
          });
        }, 5000);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.adminRefreshTimer) {
      clearInterval(this.adminRefreshTimer);
    }
  }

  getPartnerStats(partnerName: string) {
    const target = (partnerName || '').toLowerCase().trim();

    const partnerOrders = this.ordersList.filter(o => {
      const courier = (o.courierPartner || '').toLowerCase().trim();
      return courier === target;
    });

    const assigned = partnerOrders.length;
    const delivered = partnerOrders.filter(o => o.status === 'DELIVERED').length;
    const canceled = partnerOrders.filter(o => o.status === 'CANCELLED' || o.status === 'RTO').length;

    return {
      assigned: assigned,
      delivered: delivered,
      canceled: canceled,
      active: assigned - (delivered + canceled)
    };
  }

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
    this.cdr.detectChanges();
  }

  openViewItemsModal(order: any): void {
    this.selectedOrderForItems = order;
    this.showItemsModal = true;
    this.cdr.detectChanges();
  }

  openAddProductModalFast(): void {
    this.newProd = { name: '', category: 'electronics', price: 0, stockQuantity: 10, description: '', icon: '🎧' };
    this.showAddProductModal = true;
    this.cdr.detectChanges();
  }

  openEditProductModal(product: any): void {
    this.editingProd = { ...product };
    this.showEditProductModal = true;
    this.cdr.detectChanges();
  }

  closeModals(): void {
    this.showAddProductModal = false;
    this.showEditProductModal = false;
    this.showDistributionModal = false;
    this.showInvoiceModal = false;
    this.showItemsModal = false;
    this.selectedOrderForDispatch = null;
    this.selectedInvoiceOrder = null;
    this.selectedOrderForItems = null;
    this.cdr.detectChanges();
  }

  loadAllLiveDatabaseData(): void {
    this.api.getProducts().pipe(catchError(() => of([]))).subscribe(prods => {
      this.adminProducts = prods || [];
      this.applyProductFilters();
      this.cdr.detectChanges();
    });

    this.api.getLowStockAlerts().pipe(catchError(() => of([]))).subscribe(alerts => {
      this.lowStockProducts = alerts || [];
      this.cdr.detectChanges();
    });

    this.api.getAllOrders().pipe(catchError(() => of([]))).subscribe(orders => {
      this.ordersList = orders || [];
      this.applyOrderFilters();
      this.calculateRealMetrics(this.ordersList);
      this.loadRefundsData();
      this.cdr.detectChanges();
    });

    this.api.getAuditLogs().pipe(catchError(() => of([]))).subscribe(logs => {
      this.auditLogsList = logs || [];
      this.applyAuditFilters();
      this.cdr.detectChanges();
    });

    this.loadUserAccounts();
  }

  loadUserAccounts(): void {
    this.api.getAllUsers().pipe(catchError(() => of([]))).subscribe(users => {
      if (users && users.length > 0) {
        this.userAccountsList = users
          .filter((u: any) => {
            const role = (u.role || '').toLowerCase().trim();
            const email = (u.email || '').toLowerCase().trim();
            return role !== 'admin' && email !== 'admin@gmail.com';
          })
          .map((u: any) => ({
            id: u.id,
            name: u.name || 'Registered User',
            email: u.email,
            role: u.role || 'user', // 🟢 ADDED: Preserves user role property
            status: u.status || 'ACTIVE',
            blockReason: u.blockReason || ''
          }));
      } else {
        this.userAccountsList = [];
      }
      this.applyUserFilters();
      this.cdr.detectChanges();
    });
  }

  loadAllLiveDatabaseDataSilent(): void {
    this.api.getAllOrders().pipe(catchError(() => of([]))).subscribe(orders => {
      this.ordersList = orders || [];
      this.applyOrderFilters();
      this.calculateRealMetrics(this.ordersList);
    });

    this.api.getAuditLogs().pipe(catchError(() => of([]))).subscribe(logs => {
      this.auditLogsList = logs || [];
      this.applyAuditFilters();
    });
  }

  getItemList(order: any): any[] {
    if (!order) return [];

    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      return order.items.map((item: any) => {
        const pId = item.productId || item.id || 'PROD-001';
        const catalogInfo = this.adminProducts.find(p => String(p.id) === String(pId) || String(p.productId) === String(pId));
        const name = catalogInfo?.name || item.productName || item.name || 'Product Item';
        const icon = catalogInfo?.icon || item.productIcon || '📦';
        const qty = Number(item.quantity || 1);
        const unitPrice = Number(catalogInfo?.price || item.unitPrice || item.price || item.productPrice || 0);

        return {
          id: pId,
          name: name,
          icon: icon,
          quantity: qty,
          unitPrice: unitPrice,
          subtotal: unitPrice * qty
        };
      });
    }

    const rawIds = (order.productId || '')
      .toString()
      .split(',')
      .map((id: string) => id.trim())
      .filter((id: string) => id.length > 0);

    const rawQtyStr = (order.quantity !== undefined && order.quantity !== null) ? order.quantity.toString() : '1';
    const parsedQtyArray = rawQtyStr.split(',').map((q: string) => parseInt(q.trim(), 10) || 1);

    if (rawIds.length === 0) return [];

    return rawIds.map((pId: string, index: number) => {
      const catalogInfo = this.adminProducts.find(p => String(p.id) === String(pId) || String(p.productId) === String(pId));
      const name = catalogInfo?.name || order.productName || pId;
      const icon = catalogInfo?.icon || '📦';

      let qty = 1;
      if (parsedQtyArray.length === rawIds.length) {
        qty = parsedQtyArray[index];
      } else if (parsedQtyArray.length === 1 && rawIds.length === 1) {
        qty = parsedQtyArray[0];
      } else {
        qty = 1;
      }

      const unitPrice = Number(catalogInfo?.price || order.price || order.productPrice || 0);
      return {
        id: pId,
        name: name,
        icon: icon,
        quantity: qty,
        unitPrice: unitPrice,
        subtotal: unitPrice * qty
      };
    });
  }

  getTotalQuantity(order: any): number {
    const list = this.getItemList(order);
    return list.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  }

  getCalculatedGrandTotal(order: any): number {
    const list = this.getItemList(order);
    const computed = list.reduce((sum, item) => sum + item.subtotal, 0);
    return computed > 0 ? computed : Number(order?.totalBill || order?.grandTotal || 0);
  }

  loadRefundsData(): void {
    this.api.getRefundRequests().pipe(catchError(() => of([]))).subscribe(refunds => {
      this.refundList = refunds || [];

      const cancelledOrders = this.ordersList.filter(o => o.status === 'CANCELLED' || o.status === 'RTO');
      cancelledOrders.forEach((ord, index) => {
        const orderIdStr = ord.orderId || ord.id;
        const exists = this.refundList.some(r => String(r.orderId) === String(orderIdStr));
        
        if (!exists) {
          this.refundList.push({
            id: ord.id || index + 1000,
            orderId: orderIdStr,
            paymentMethod: ord.paymentMethod || 'CARD',
            cancellationReason: ord.cancellationReason || ord.cancelReason || 'User or Logistics Cancellation',
            refundAmount: ord.totalBill || ord.totalAmount || 0,
            status: 'PENDING'
          });
        }
      });

      this.applyRefundFilters();
      this.calculateRefundMetrics(this.refundList);
      this.cdr.detectChanges();
    });
  }

  calculateRealMetrics(orders: any[]): void {
    this.totalOrdersCount = orders ? orders.length : 0;

    this.totalRevenue = orders
      .filter(o => o.status !== 'CANCELLED' && o.status !== 'RTO')
      .reduce((sum, o) => sum + (o.totalBill || 0), 0);

    this.activeOrdersCount = orders
      .filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'RTO')
      .length;
  }

  calculateRefundMetrics(refunds: any[]): void {
    this.totalRefundsProcessed = refunds
      .filter(r => r.status === 'PROCESSED')
      .reduce((sum, r) => sum + (r.refundAmount || 0), 0);
  }

  applyProductFilters(): void {
    const q = (this.prodSearch || '').toLowerCase().trim();
    this.filteredAdminProducts = this.adminProducts.filter(p => {
      const catMatch = this.prodCatFilter === 'ALL' || (p.category && p.category.toLowerCase() === this.prodCatFilter.toLowerCase());
      const searchMatch = !q || (p.name && p.name.toLowerCase().includes(q));
      return catMatch && searchMatch;
    });
    this.cdr.detectChanges();
  }

  applyOrderFilters(): void {
    const q = (this.cityFilter || '').toLowerCase().trim();
    this.filteredOrders = this.ordersList.filter(o => {
      const statusMatch = this.orderStatusFilter === 'ALL' || o.status === this.orderStatusFilter;
      
      const idMatch = o.orderId && String(o.orderId).toLowerCase().includes(q);
      const nameMatch = o.recipientName && o.recipientName.toLowerCase().includes(q);
      const phoneMatch = o.recipientPhone && o.recipientPhone.toLowerCase().includes(q);
      const addrMatch = o.shippingAddress && o.shippingAddress.toLowerCase().includes(q);

      const searchMatch = !q || idMatch || nameMatch || phoneMatch || addrMatch;
      return statusMatch && searchMatch;
    });
    this.cdr.detectChanges();
  }

  applyRefundFilters(): void {
    const q = (this.refundSearch || '').toLowerCase().trim();
    this.filteredRefundList = this.refundList.filter(r => {
      const statusMatch = this.refundStatusFilter === 'ALL' || r.status === this.refundStatusFilter;
      const orderMatch = r.orderId && String(r.orderId).toLowerCase().includes(q);
      const reasonMatch = r.cancellationReason && r.cancellationReason.toLowerCase().includes(q);

      return statusMatch && (!q || orderMatch || reasonMatch);
    });
    this.cdr.detectChanges();
  }

  // 🟢 UPDATED: Filter by both Status AND Role
  applyUserFilters(): void {
    const q = (this.userSearch || '').toLowerCase().trim();
    this.filteredUserAccountsList = this.userAccountsList.filter(u => {
      const statusMatch = this.userStatusFilter === 'ALL' || u.status === this.userStatusFilter;
      const roleMatch = this.userRoleFilter === 'ALL' || (u.role && u.role.toLowerCase().trim() === this.userRoleFilter.toLowerCase().trim());
      
      const nameMatch = u.name && u.name.toLowerCase().includes(q);
      const emailMatch = u.email && u.email.toLowerCase().includes(q);

      return statusMatch && roleMatch && (!q || nameMatch || emailMatch);
    });
    this.cdr.detectChanges();
  }

  applyAuditFilters(): void {
    const q = (this.auditSearch || '').toLowerCase().trim();
    this.filteredAuditLogsList = this.auditLogsList.filter(log => {
      const moduleMatch = this.auditModuleFilter === 'ALL' || log.actionModule === this.auditModuleFilter;
      const msgMatch = log.actionMessage && log.actionMessage.toLowerCase().includes(q);
      const userMatch = log.adminUsername && log.adminUsername.toLowerCase().includes(q);

      return moduleMatch && (!q || msgMatch || userMatch);
    });
    this.cdr.detectChanges();
  }

  submitProduct(): void {
    if (!this.newProd.name.trim()) {
      alert('Product Name is required!');
      return;
    }

    this.api.addProduct(this.newProd).subscribe({
      next: () => {
        alert('🎉 Product saved to database!');
        this.api.logAuditAction('Administrator', 'PRODUCT', `Added new product: ${this.newProd.name}`).subscribe();
        this.closeModals();
        this.loadAllLiveDatabaseData();
      }
    });
  }

  submitProductEdit(): void {
    if (!this.editingProd.name.trim()) return;

    this.api.addProduct(this.editingProd).subscribe({
      next: () => {
        alert('🎉 Product updated successfully!');
        this.api.logAuditAction('Administrator', 'PRODUCT', `Edited product ID: ${this.editingProd.id}`).subscribe();
        this.closeModals();
        this.loadAllLiveDatabaseData();
      }
    });
  }

  deleteProduct(id: string): void {
    if (confirm('Delete this product from catalog?')) {
      this.api.deleteProduct(id).subscribe({
        next: () => {
          this.api.logAuditAction('Administrator', 'PRODUCT', `Deleted product ID: ${id}`).subscribe();
          this.loadAllLiveDatabaseData();
        }
      });
    }
  }

  openRestockPrompt(item: any): void {
    const qtyStr = prompt(`Enter restock quantity for ${item.name}:`, '15');
    if (qtyStr) {
      const addQty = parseInt(qtyStr, 10);
      if (!isNaN(addQty) && addQty > 0) {
        this.api.restoreStock(item.id || item.productId, addQty).subscribe({
          next: () => {
            this.api.logAuditAction('Administrator', 'INVENTORY', `Restocked ${addQty} units for product: ${item.name}`).subscribe();
            this.loadAllLiveDatabaseData();
          }
        });
      }
    }
  }

  openDistributionModal(order: any): void {
    this.selectedOrderForDispatch = order;
    this.dispatchStage = 'PACKING';
    this.dispatchPartner = order.courierPartner && order.courierPartner !== 'Delivery Partner Not Assigned Yet' 
      ? order.courierPartner 
      : 'BlueDart Express';
    this.cancelReasonSelection = 'Customer Requested Cancellation';
    this.customCancelReason = '';
    this.showDistributionModal = true;
    this.cdr.detectChanges();
  }

  submitDistributionUpdate(): void {
    if (this.selectedOrderForDispatch) {
      const orderId = this.selectedOrderForDispatch.orderId || this.selectedOrderForDispatch.id;
      let finalReason = '';

      if (this.dispatchStage === 'CANCELLED') {
        finalReason = this.cancelReasonSelection === 'OTHERS' 
          ? this.customCancelReason.trim() 
          : this.cancelReasonSelection;

        if (!finalReason) {
          alert('Cancellation reason is required when marking order as CANCELLED!');
          return;
        }
        this.selectedOrderForDispatch.cancellationReason = finalReason;
      }

      this.api.updateOrderStatus(orderId, this.dispatchStage, this.dispatchPartner).subscribe({
        next: () => {
          this.selectedOrderForDispatch.courierPartner = this.dispatchPartner;

          const auditMsg = `Assigned Order #${orderId} to partner ${this.dispatchPartner} (Stage: ${this.dispatchStage})${finalReason ? ' Reason: ' + finalReason : ''}`;
          
          this.api.logAuditAction('Administrator', 'DISTRIBUTION', auditMsg).subscribe({
            next: () => {
              this.closeModals();
              this.loadAllLiveDatabaseData();
            },
            error: () => {
              this.closeModals();
              this.loadAllLiveDatabaseData();
            }
          });
        },
        error: () => {
          this.closeModals();
          this.loadAllLiveDatabaseData();
        }
      });
    }
  }

  openInvoiceModal(order: any): void {
    this.selectedInvoiceOrder = order;
    this.showInvoiceModal = true;
    this.cdr.detectChanges();
  }

  printInvoice(): void {
    window.print();
  }

  approveRefund(refundId: number): void {
    this.api.approveRefund(refundId).pipe(catchError(() => of(null))).subscribe({
      next: () => {
        const refItem = this.refundList.find(r => r.id === refundId);
        if (refItem) {
          refItem.status = 'PROCESSED';
        }
        this.api.logAuditAction('Administrator', 'REFUND', `Approved refund ID #${refundId}`).subscribe();
        this.calculateRefundMetrics(this.refundList);
        this.applyRefundFilters();
        this.cdr.detectChanges();
        alert('✅ Refund processed successfully!');
      }
    });
  }

  toggleUserStatus(user: any): void {
    if (user.status === 'ACTIVE') {
      const reason = prompt(`Enter reason for blocking ${user.email}:`, 'Policy violation or suspicious activity');
      if (!reason || !reason.trim()) {
        alert('Block reason is required!');
        return;
      }
      
      this.api.blockUser(user.id, reason.trim()).subscribe({
        next: () => {
          user.status = 'BLOCKED';
          user.blockReason = reason.trim();
          this.api.logAuditAction('Administrator', 'USER_MGMT', `Blocked user ${user.email} Reason: ${reason}`).subscribe();
          this.applyUserFilters();
          alert(`🚫 User ${user.email} is now BLOCKED.`);
        },
        error: () => {
          user.status = 'BLOCKED';
          user.blockReason = reason.trim();
          this.applyUserFilters();
          alert(`🚫 User ${user.email} is now BLOCKED.`);
        }
      });
    } else {
      this.api.unblockUser(user.id).subscribe({
        next: () => {
          user.status = 'ACTIVE';
          user.blockReason = '';
          this.api.logAuditAction('Administrator', 'USER_MGMT', `Unblocked user ${user.email}`).subscribe();
          this.applyUserFilters();
          alert(`🔓 User ${user.email} is now UNBLOCKED.`);
        },
        error: () => {
          user.status = 'ACTIVE';
          user.blockReason = '';
          this.applyUserFilters();
          alert(`🔓 User ${user.email} is now UNBLOCKED.`);
        }
      });
    }
  }
}