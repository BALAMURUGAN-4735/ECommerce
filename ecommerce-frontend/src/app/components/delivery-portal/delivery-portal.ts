import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-delivery-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './delivery-portal.html',
  styleUrls: ['./delivery-portal.css']
})
export class DeliveryPortalComponent implements OnInit {
  allOrders: any[] = [];
  activeTab: 'assigned' | 'delivered' | 'canceled' = 'assigned';

  showCancelModal = false;
  selectedOrderIdForCancel: string | null = null;
  cancelPresetReason = 'Customer Unreachable on Phone';
  customCancelReason = '';

  showOtpModal = false;
  selectedOrderForOtp: any = null;
  enteredOtp = '';
  isCashCollected = false;

  showAttemptModal = false;
  selectedOrderForAttempt: any = null;
  attemptNote = 'Customer Phone Unanswered / Switch off';

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // 🟢 1. TOTAL ASSIGNED (ALL TIME HISTORY: Active + Delivered + Cancelled = 5)
  get totalAssignedCount(): number {
    return this.allOrders.length;
  }

  // 🟢 2. ACTIVE / REMAINING PACKAGES (Total minus Delivered & Cancelled = 1)
  get activePackagesCount(): number {
    return this.allOrders.filter(o => 
      o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'RTO'
    ).length;
  }

  // 🟢 3. TAB BUTTON COUNT ALIAS (Matches active packages count = 1)
  get assignedOrdersCount(): number {
    return this.totalAssignedCount;
  }

  // 🟢 4. DELIVERED ORDERS COUNT (= 3)
  get deliveredOrdersCount(): number {
    return this.allOrders.filter(o => o.status === 'DELIVERED').length;
  }

  // 🟢 5. CANCELLED / RTO COUNT (= 1)
  get canceledOrdersCount(): number {
    return this.allOrders.filter(o => o.status === 'CANCELLED' || o.status === 'RTO').length;
  }

  get currentPartner(): any {
    return this.auth.getCurrentUser();
  }


  get filteredOrders(): any[] {
    if (this.activeTab === 'assigned') {
      return this.allOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'RTO');
    } else if (this.activeTab === 'delivered') {
      return this.allOrders.filter(o => o.status === 'DELIVERED');
    } else {
      return this.allOrders.filter(o => o.status === 'CANCELLED' || o.status === 'RTO');
    }
  }

  ngOnInit(): void {
    this.loadAssignedDeliveries();
  }

  setActiveTab(tab: 'assigned' | 'delivered' | 'canceled'): void {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  // 🟢 EXTRACTS REAL USER CREDENTIALS & STANDARDIZES PARTNER STRING
  getPartnerName(): string {
    const partner = this.currentPartner as any;
    const name = partner?.deliveryPartner || partner?.name || '';
    return name.trim();
  }

  loadAssignedDeliveries(): void {
    const partnerName = this.getPartnerName();

    if (!partnerName) {
      console.warn('No active delivery partner logged in.');
      return;
    }

    this.api.getDeliveryPartnerOrders(partnerName).subscribe({
      next: (orders) => {
        this.allOrders = orders || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load delivery routes:', err)
    });
  }

  // 🟢 LOGS STAGE CHANGES MADE BY DELIVERY PARTNERS
  updateOrderStatus(orderId: string, newStatus: string): void {
    const partnerName = this.getPartnerName();

    this.api.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        alert(`📦 Order #${orderId} stage updated to ${newStatus}!`);

        // Exact Audit Log Entry
        const logMsg = `Delivery Partner ${partnerName} updated Order #${orderId} stage to ${newStatus}`;
        this.api.logAuditAction(partnerName, 'DISTRIBUTION', logMsg).subscribe();

        this.loadAssignedDeliveries();
      },
      error: () => alert('Failed to update delivery stage.')
    });
  }

  openOtpModal(order: any): void {
    this.selectedOrderForOtp = order;
    this.enteredOtp = '';
    this.isCashCollected = false;
    this.showOtpModal = true;
    this.cdr.detectChanges();
  }

  closeOtpModal(): void {
    this.showOtpModal = false;
    this.selectedOrderForOtp = null;
    this.cdr.detectChanges();
  }

  // 🟢 LOGS OTP VERIFICATION & DELIVERY CONFIRMATION
  confirmOtpAndDeliver(): void {
    if (!this.enteredOtp || this.enteredOtp.trim().length !== 4) {
      alert('Please enter a valid 4-digit Delivery Verification OTP.');
      return;
    }

    if (this.selectedOrderForOtp?.paymentMethod === 'COD' && !this.isCashCollected) {
      alert('💵 PAYMENT PENDING: Please check "Cash Received" before completing delivery!');
      return;
    }

    if (this.selectedOrderForOtp) {
      const partnerName = this.getPartnerName();
      const orderId = this.selectedOrderForOtp.orderId || this.selectedOrderForOtp.id;
      const realOtp = this.selectedOrderForOtp.deliveryOtp;

      if (realOtp && this.enteredOtp.trim() !== realOtp.toString().trim()) {
        alert('❌ INVALID OTP! Check customer tracking screen.');
        return;
      }

      this.api.updateOrderStatus(orderId, 'DELIVERED').subscribe({
        next: () => {
          alert('🎉 OTP Verified & Delivery Confirmed!');

          // Audit Log Entry
          const logMsg = `Delivery Partner ${partnerName} verified OTP and marked Order #${orderId} as DELIVERED`;
          this.api.logAuditAction(partnerName, 'DISTRIBUTION', logMsg).subscribe();

          this.closeOtpModal();
          this.loadAssignedDeliveries();
        },
        error: () => alert('Failed to confirm delivery.')
      });
    }
  }

  openAttemptModal(order: any): void {
    this.selectedOrderForAttempt = order;
    this.attemptNote = 'Customer Phone Unanswered / Switch off';
    this.showAttemptModal = true;
    this.cdr.detectChanges();
  }

  closeAttemptModal(): void {
    this.showAttemptModal = false;
    this.selectedOrderForAttempt = null;
    this.cdr.detectChanges();
  }

  // 🟢 LOGS FAILED DELIVERY ATTEMPTS
  submitFailedAttempt(): void {
    if (this.selectedOrderForAttempt) {
      const partnerName = this.getPartnerName();
      const orderId = this.selectedOrderForAttempt.orderId || this.selectedOrderForAttempt.id;

      this.api.recordDeliveryAttempt(orderId, this.attemptNote).subscribe({
        next: (res) => {
          alert(`⚠️ ${res.message}`);

          // Audit Log Entry
          const logMsg = `Delivery Partner ${partnerName} recorded failed delivery attempt for Order #${orderId}. Reason: ${this.attemptNote}`;
          this.api.logAuditAction(partnerName, 'DISTRIBUTION', logMsg).subscribe();

          this.closeAttemptModal();
          this.loadAssignedDeliveries();
        },
        error: () => alert('Failed to record attempt.')
      });
    }
  }

  openCancelModal(orderId: string): void {
    this.selectedOrderIdForCancel = orderId;
    this.cancelPresetReason = 'Customer Refused Delivery';
    this.customCancelReason = '';
    this.showCancelModal = true;
    this.cdr.detectChanges();
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.cdr.detectChanges();
  }

  // 🟢 LOGS FIELD CANCELLATIONS
  submitOnFieldCancellation(): void {
    const finalReason = this.cancelPresetReason === 'OTHERS' ? this.customCancelReason.trim() : this.cancelPresetReason;

    if (!finalReason) {
      alert('Mandatory Requirement: Please provide a cancellation reason.');
      return;
    }

    if (this.selectedOrderIdForCancel) {
      const partnerName = this.getPartnerName();
      const orderId = this.selectedOrderIdForCancel;

      this.api.cancelOrder(orderId, `[Field Agent Note]: ${finalReason}`).subscribe({
        next: () => {
          alert('On-field cancellation logged.');

          // Audit Log Entry
          const logMsg = `Delivery Partner ${partnerName} cancelled Order #${orderId} on-field. Reason: ${finalReason}`;
          this.api.logAuditAction(partnerName, 'DISTRIBUTION', logMsg).subscribe();

          this.closeCancelModal();
          this.loadAssignedDeliveries();
        },
        error: () => alert('Failed to process cancellation.')
      });
    }
  }

  logoutPartner(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}