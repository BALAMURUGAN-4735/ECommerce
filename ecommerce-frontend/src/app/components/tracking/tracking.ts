import { Component, OnInit, OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { StorageService } from '../../services/storage';

interface GroupedOrder {
  orderId: string;
  orderDate: any;
  status: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  cancelReason?: string;
  deliveryOtp?: string;
  items: Array<{
    productId: string;
    productName: string;
    productIcon: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  grandTotal: number;
}

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tracking.html',
  styleUrls: ['./tracking.css']
})
export class TrackingComponent implements OnInit, OnDestroy {
  rawOrders: any[] = [];
  userOrders: GroupedOrder[] = [];
  filteredOrders: GroupedOrder[] = [];
  selectedOrder: GroupedOrder | null = null;
  trackingDetails: any = null;
  productsMap = new Map<string, any>();
  
  // 🟢 STORES STAGE TIMESTAMPS FROM AUDIT LOGS PER ORDER ID
  // Key: orderId, Value: Map<stageIndex, formattedTimestamp>
  orderStageTimestamps = new Map<string, Map<number, string>>();

  // Filter & Search Controls
  searchQuery: string = '';
  selectedMonth: string = 'ALL';
  selectedYear: string = 'ALL';
  availableYears: number[] = [2026, 2025, 2024];

  statusOrder = ['PLACED', 'PACKING', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  showCancelModal = false;
  showAllItemsModal = false;
  selectedOrderIdForCancel: string | null = null;
  cancelReasonOption = 'Ordered by mistake';
  manualCancelReason = '';

  isAutoRefreshActive: boolean = true;
  autoRefreshTimer: any;

  constructor(
    private api: ApiService,
    public auth: AuthService,
    public storage: StorageService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get currentTabUser() {
    return this.auth.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadProductsAndOrders();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  toggleAutoRefresh(): void {
    this.isAutoRefreshActive = !this.isAutoRefreshActive;
    if (this.isAutoRefreshActive) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  startAutoRefresh(): void {
    this.stopAutoRefresh();
    if (isPlatformBrowser(this.platformId)) {
      this.autoRefreshTimer = setInterval(() => {
        if (this.isAutoRefreshActive) {
          this.loadUserOrdersSilent();
        }
      }, 5000);
    }
  }

  stopAutoRefresh(): void {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
    }
  }

  loadProductsAndOrders(): void {
    this.api.getProducts().subscribe({
      next: (products) => {
        if (products) {
          products.forEach((p: any) => {
            const pId = p.id || p.productId;
            if (pId) this.productsMap.set(String(pId), p);
          });
        }
        this.loadUserOrders();
      },
      error: () => {
        this.loadUserOrders();
      }
    });
  }

  loadUserOrders(): void {
    const user = this.currentTabUser;
    if (user) {
      this.api.getUserOrders(user.id).subscribe({
        next: (orders) => {
          this.rawOrders = orders || [];
          this.userOrders = this.groupOrdersByOrderId(this.rawOrders);
          this.applyFilters();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error fetching orders:', err)
      });
    }
  }

  loadUserOrdersSilent(): void {
    const user = this.currentTabUser;
    if (user) {
      this.api.getUserOrders(user.id).subscribe({
        next: (orders) => {
          this.rawOrders = orders || [];
          this.userOrders = this.groupOrdersByOrderId(this.rawOrders);
          this.applyFiltersSilent();
        }
      });
    }
  }

  applyFiltersSilent(): void {
    this.filteredOrders = this.userOrders.filter(order => {
      const orderDate = new Date(order.orderDate || Date.now());
      const monthMatches = this.selectedMonth === 'ALL' || orderDate.getMonth().toString() === this.selectedMonth;
      const yearMatches = this.selectedYear === 'ALL' || orderDate.getFullYear().toString() === this.selectedYear;
      
      const query = this.searchQuery.trim().toLowerCase();
      const orderIdStr = (order.orderId || '').toLowerCase();
      
      const matchesProducts = order.items.some(i => 
        (i.productId || '').toLowerCase().includes(query) || 
        (i.productName || '').toLowerCase().includes(query)
      );
      return monthMatches && yearMatches && (!query || orderIdStr.includes(query) || matchesProducts);
    });

    if (this.selectedOrder) {
      const updated = this.filteredOrders.find(o => o.orderId === this.selectedOrder?.orderId);
      if (updated) {
        this.selectedOrder = updated;
        this.fetchOrderAuditTimestamps(updated.orderId);
      }
    }
    this.cdr.detectChanges();
  }

  groupOrdersByOrderId(orders: any[]): GroupedOrder[] {
    if (!orders || orders.length === 0) return [];

    const map = new Map<string, GroupedOrder>();

    orders.forEach(order => {
      const key = order.orderId || order.id;
      if (!key) return;

      const rawProductIds = (order.productId || '')
        .toString()
        .split(',')
        .map((id: string) => id.trim())
        .filter((id: string) => id.length > 0);

      const rawQtyStr = (order.quantity !== undefined && order.quantity !== null) ? order.quantity.toString() : '1';
      const parsedQtyArray = rawQtyStr.split(',').map((q: string) => parseInt(q.trim(), 10) || 1);

      let calculatedOrderTotal = 0;

      const items = rawProductIds.map((pId: string, index: number) => {
        const productInfo = this.productsMap.get(pId);
        const productName = productInfo?.name || order.productName || pId;
        const productIcon = productInfo?.icon || '🛒';

        let itemQty = 1;
        if (parsedQtyArray.length === rawProductIds.length) {
          itemQty = parsedQtyArray[index];
        } else if (parsedQtyArray.length === 1 && rawProductIds.length === 1) {
          itemQty = parsedQtyArray[0];
        } else {
          itemQty = 1;
        }

        const unitPrice = Number(productInfo?.price || order.price || order.productPrice || 0);
        const subtotal = unitPrice * itemQty;

        calculatedOrderTotal += subtotal;

        return {
          productId: pId,
          productName: productName,
          productIcon: productIcon,
          quantity: itemQty,
          unitPrice: unitPrice,
          subtotal: subtotal
        };
      });

      const finalGrandTotal = calculatedOrderTotal > 0 ? calculatedOrderTotal : Number(order.grandTotal || order.totalBill || 0);

      if (!map.has(key)) {
        map.set(key, {
          orderId: key,
          orderDate: order.orderDate || order.createdAt,
          status: order.status || 'PLACED',
          recipientName: order.recipientName || 'Valued Customer',
          recipientPhone: order.recipientPhone || 'N/A',
          shippingAddress: order.shippingAddress || '',
          paymentMethod: order.paymentMethod || 'CARD',
          cancelReason: order.cancelReason || order.cancellationReason,
          deliveryOtp: order.deliveryOtp || '4735',
          items: items,
          grandTotal: finalGrandTotal
        });
      }
    });

    return Array.from(map.values());
  }

  applyFilters(): void {
    this.filteredOrders = this.userOrders.filter(order => {
      const orderDate = new Date(order.orderDate || Date.now());
      const monthMatches = this.selectedMonth === 'ALL' || orderDate.getMonth().toString() === this.selectedMonth;
      const yearMatches = this.selectedYear === 'ALL' || orderDate.getFullYear().toString() === this.selectedYear;
      
      const query = this.searchQuery.trim().toLowerCase();
      const orderIdStr = (order.orderId || '').toLowerCase();
      
      const matchesProducts = order.items.some(i => 
        (i.productId || '').toLowerCase().includes(query) || 
        (i.productName || '').toLowerCase().includes(query)
      );
      const searchMatches = !query || orderIdStr.includes(query) || matchesProducts;

      return monthMatches && yearMatches && searchMatches;
    });

    if (this.filteredOrders.length > 0) {
      const exists = this.filteredOrders.find(o => o.orderId === this.selectedOrder?.orderId);
      this.selectOrder(exists ? exists : this.filteredOrders[0]);
    } else {
      this.selectedOrder = null;
    }
    this.cdr.detectChanges();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedMonth = 'ALL';
    this.selectedYear = 'ALL';
    this.applyFilters();
  }

  selectOrder(order: GroupedOrder): void {
    this.selectedOrder = order;

    this.api.getTrackingDetails(order.orderId).subscribe({
      next: (details) => {
        this.trackingDetails = details;
        this.cdr.detectChanges();
      },
      error: () => {
        this.trackingDetails = null;
        this.cdr.detectChanges();
      }
    });

    this.fetchOrderAuditTimestamps(order.orderId);
  }

  // 🟢 FIXED: ACCURATELY PARSES AUDIT LOGS WITHOUT OVERWRITING OTHER STAGES
  fetchOrderAuditTimestamps(orderId: string): void {
    this.api.getAuditLogs().subscribe({
      next: (logs) => {
        if (logs && logs.length > 0) {
          const newMap = new Map<number, string>();

          // Sort logs chronologically (oldest execution first)
          const orderLogs = logs
            .filter(l => l.actionMessage && l.actionMessage.includes(orderId))
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

          orderLogs.forEach(l => {
            const msg = l.actionMessage.toUpperCase();
            const timeStr = new Date(l.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            // 1. STAGE 2: PACKING / ASSIGNED PARTNER
            if ((msg.includes('PACKING') || msg.includes('ASSIGNED')) && !newMap.has(2)) {
              newMap.set(2, timeStr);
            }

            // 2. STAGE 3: DISPATCHED
            if (msg.includes('STAGE TO DISPATCHED') || msg.includes('MARKED AS DISPATCHED')) {
              newMap.set(3, timeStr);
            }

            // 3. STAGE 4: OUT FOR DELIVERY
            if (msg.includes('STAGE TO OUT_FOR_DELIVERY') || msg.includes('OUT FOR DELIVERY')) {
              newMap.set(4, timeStr);
            }

            // 4. STAGE 5: DELIVERED
            if (msg.includes('MARKED') && msg.includes('AS DELIVERED') || msg.includes('STAGE TO DELIVERED')) {
              newMap.set(5, timeStr);
            }

            // 5. CANCELLED / RTO (Only sets the final cancellation index, does NOT touch Stage 2/3)
            if (msg.includes('CANCELLED') || msg.includes('RTO')) {
              const cancelIndex = this.selectedOrder ? this.getCancelledLastStageIndex(this.selectedOrder) : 4;
              // If stage 3 or 4 reached before cancel, map it cleanly
              if (!newMap.has(cancelIndex)) {
                newMap.set(cancelIndex, timeStr);
              }
            }
          });

          // Save map specifically for this order ID
          this.orderStageTimestamps.set(orderId, newMap);
        }
        this.cdr.detectChanges();
      }
    });
  }

  getTotalQuantity(order: GroupedOrder | null): number {
    if (!order || !order.items) return 0;
    return order.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  }

  openAllItemsModal(): void {
    this.showAllItemsModal = true;
    this.cdr.detectChanges();
  }

  closeAllItemsModal(): void {
    this.showAllItemsModal = false;
    this.cdr.detectChanges();
  }

  getStepClass(currentStatus: string, stepStatus: string): string {
    const activeStatus = currentStatus ? currentStatus.toUpperCase() : 'PLACED';
    const currentIndex = this.statusOrder.indexOf(activeStatus);
    const stepIndex = this.statusOrder.indexOf(stepStatus);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return '';
  }

  // 🟢 FIXED: PREVENTS STAGES FROM COPIING THE SAME CURRENT HOUR
  getStageTimestamp(stageIndex: number): string {
    if (!this.selectedOrder) return '';

    const orderId = this.selectedOrder.orderId;
    const timestamps = this.orderStageTimestamps.get(orderId);

    // Stage 1: Placed Date (Original Creation Time)
    if (stageIndex === 1) {
      const baseDate = new Date(this.selectedOrder.orderDate || Date.now());
      return baseDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    const currentStatus = (this.selectedOrder.status || 'PLACED').toUpperCase();

    // Handle Cancelled / RTO Orders
    if (currentStatus === 'CANCELLED' || currentStatus === 'RTO') {
      const lastReached = this.getCancelledLastStageIndex(this.selectedOrder);
      if (stageIndex <= lastReached) {
        if (timestamps && timestamps.has(stageIndex)) {
          return timestamps.get(stageIndex)!;
        }
        // Fallback to Placed Date for cancelled past stages
        const baseDate = new Date(this.selectedOrder.orderDate || Date.now());
        const fixedOffset = new Date(baseDate.getTime() + (stageIndex - 1) * 2 * 60 * 60 * 1000);
        return fixedOffset.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
      return '--';
    }

    const currentStageIndex = this.statusOrder.indexOf(currentStatus) + 1;

    // Stage not reached yet
    if (stageIndex > currentStageIndex) {
      return '--';
    }

    // Priority 1: Exact Audit Log timestamp from database
    if (timestamps && timestamps.has(stageIndex)) {
      return timestamps.get(stageIndex)!;
    }

    // Priority 2: Fallback offset from order date for intermediate steps without logs
    const baseDate = new Date(this.selectedOrder.orderDate || Date.now());
    const fixedOffsetHours = (stageIndex - 1) * 2;
    const calculatedTime = new Date(baseDate.getTime() + fixedOffsetHours * 60 * 60 * 1000);

    return calculatedTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCancelledLastStageIndex(order: GroupedOrder): number {
    const reason = (order.cancelReason || '').toLowerCase();
    if (reason.includes('field agent note') || reason.includes('refused delivery') || reason.includes('out for delivery')) {
      return 4;
    } else if (reason.includes('dispatched') || reason.includes('courier')) {
      return 3;
    } else if (reason.includes('packing')) {
      return 2;
    }
    return 2;
  }

  openCancelModal(orderId: string): void {
    this.selectedOrderIdForCancel = orderId;
    this.cancelReasonOption = 'Ordered by mistake';
    this.manualCancelReason = '';
    this.showCancelModal = true;
    this.cdr.detectChanges();
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.cdr.detectChanges();
  }

  submitCancellation(): void {
    let reason = this.cancelReasonOption;
    if (this.cancelReasonOption === 'OTHERS') {
      if (!this.manualCancelReason.trim()) return alert('Please enter a reason.');
      reason = this.manualCancelReason.trim();
    }

    if (this.selectedOrderIdForCancel) {
      const userName = this.currentTabUser?.name || 'Customer';
      const orderId = this.selectedOrderIdForCancel;

      this.api.cancelOrder(orderId, reason).subscribe({
        next: () => {
          alert('Order cancelled successfully.');

          const logMsg = `User ${userName} cancelled Order #${orderId}. Reason: ${reason}`;
          this.api.logAuditAction(userName, 'ORDER', logMsg).subscribe();

          this.closeCancelModal();
          this.loadUserOrders();
        },
        error: () => alert('Failed to cancel order.')
      });
    }
  }
}