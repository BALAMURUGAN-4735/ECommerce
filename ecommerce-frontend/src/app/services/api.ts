import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseApi = environment.apiUrl;

  constructor(private http: HttpClient) { }

  signUp(name: string, email: string, password: string): Observable<any> {
    const body = { name, email, password };
    return this.http.post<any>(`${this.baseApi}/api/users/register`, body);
  }

  signIn(email: string, password: string): Observable<any> {
    const params = new HttpParams().set('email', email).set('password', password);
    return this.http.post<any>(`${this.baseApi}/api/users/login`, null, { params });
  }

  syncPermanentItem(userId: number, productId: string, quantity: number, itemType: 'CART' | 'FAVORITE'): Observable<any> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('productId', productId)
      .set('quantity', quantity.toString())
      .set('itemType', itemType);
    return this.http.post<any>(`${this.baseApi}/api/users/sync-item`, null, { params });
  }

  getPermanentItems(userId: number, itemType: 'CART' | 'FAVORITE'): Observable<any[]> {
    const cleanType = itemType.toUpperCase().trim();
    return this.http.get<any[]>(`${this.baseApi}/api/users/cart-favorites-list/${userId}/${cleanType}`);
  }

  removePermanentItem(userId: number, productId: string, itemType: 'CART' | 'FAVORITE'): Observable<any> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('productId', productId)
      .set('itemType', itemType);
    return this.http.delete<any>(`${this.baseApi}/api/users/remove-item`, { params });
  }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseApi}/api/products`);
  }

  getProductById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseApi}/api/products/${id}`);
  }

  addProduct(productData: { name: string; category: string; price: number; stockQuantity: number; icon: string; description?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseApi}/api/products`, productData);
  }

  deductStock(productId: string, quantity: number): Observable<any> {
    const params = new HttpParams().set('quantity', quantity.toString());
    return this.http.put<any>(`${this.baseApi}/api/products/${productId}/deduct-stock`, null, { params });
  }

  restoreStock(productId: string, quantity: number): Observable<any> {
    const params = new HttpParams().set('quantity', quantity.toString());
    return this.http.put<any>(`${this.baseApi}/api/products/${productId}/restore-stock`, null, { params });
  }

  getLowStockAlerts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseApi}/api/products/alerts/low-stock`);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseApi}/api/products/${id}`);
  }

  getUserOrders(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseApi}/api/orders/user/${userId}`);
  }

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseApi}/api/orders`);
  }

  placeOrder(
    userId: number, 
    productId: string, 
    quantity: number, 
    address?: string, 
    paymentMethod?: string,
    recipientName?: string,
    recipientPhone?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('userId', userId.toString())
      .set('productId', productId)
      .set('quantity', quantity.toString());

    if (address) params = params.set('address', address);
    if (paymentMethod) params = params.set('paymentMethod', paymentMethod);
    if (recipientName) params = params.set('recipientName', recipientName);
    if (recipientPhone) params = params.set('recipientPhone', recipientPhone);

    return this.http.post<any>(`${this.baseApi}/api/orders/checkout`, null, { params });
  }

  placeBulkOrder(
    userId: number, 
    productIds: string,
    quantities: string,
    address?: string,
    paymentMethod?: string,
    recipientName?: string,
    recipientPhone?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('userId', userId.toString())
      .set('productId', productIds)
      .set('quantity', quantities);

    if (address) params = params.set('address', address);
    if (paymentMethod) params = params.set('paymentMethod', paymentMethod);
    if (recipientName) params = params.set('recipientName', recipientName);
    if (recipientPhone) params = params.set('recipientPhone', recipientPhone);

    return this.http.post<any>(`${this.baseApi}/api/orders/checkout`, null, { params });
  }

  cancelOrder(orderId: string, reason: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseApi}/api/orders/${orderId}/cancel`, { reason }, { headers });
  }

  // 🟢 FIXED: Path changed from /api/distributions/ to /api/orders/ to match OrderController.java
  updateOrderStatus(orderId: string, status: string, courierPartner?: string): Observable<any> {
    let params = new HttpParams().set('status', status);
    if (courierPartner) params = params.set('courierPartner', courierPartner);
    return this.http.put<any>(`${this.baseApi}/api/orders/${orderId}/status`, null, { params });
  }

  initiateDispatch(orderId: string, userId: number, courierPartner?: string, city?: string, pincode?: string): Observable<any> {
    let params = new HttpParams()
      .set('orderId', orderId)
      .set('userId', userId.toString());
    
    if (courierPartner) params = params.set('courierPartner', courierPartner);
    if (city) params = params.set('city', city);
    if (pincode) params = params.set('pincode', pincode);

    return this.http.post<any>(`${this.baseApi}/api/distribution/dispatch`, null, { params });
  }

  getTrackingDetails(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.baseApi}/api/distribution/track/${orderId}`);
  }

  filterShipmentsByRoute(city?: string, pincode?: string): Observable<any[]> {
    let params = new HttpParams();
    if (city) params = params.set('city', city);
    if (pincode) params = params.set('pincode', pincode);

    return this.http.get<any[]>(`${this.baseApi}/api/distribution/filter`, { params });
  }

  getAdminMetrics(): Observable<any> {
    return this.http.get<any>(`${this.baseApi}/api/admin/metrics`);
  }

  getRefundRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseApi}/api/admin/refunds`);
  }

  approveRefund(refundId: number): Observable<any> {
    return this.http.put<any>(`${this.baseApi}/api/admin/refunds/${refundId}/approve`, null);
  }

  logAuditAction(username: string, module: string, action: string): Observable<any> {
    const params = new HttpParams()
      .set('username', username)
      .set('module', module)
      .set('action', action);
    return this.http.post<any>(`${this.baseApi}/api/admin/logs`, null, { params });
  }

  getAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseApi}/api/admin/logs`);
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('newPassword', newPassword);
    return this.http.put<any>(`${this.baseApi}/api/users/reset-password`, null, { params });
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseApi}/api/users/all`);
  }

  blockUser(userId: number, reason: string): Observable<any> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('reason', reason);
    return this.http.put<any>(`${this.baseApi}/api/users/${userId}/block`, null, { params });
  }

  unblockUser(userId: number): Observable<any> {
    return this.http.put<any>(`${this.baseApi}/api/users/${userId}/unblock`, null);
  }

  getDeliveryPartnerOrders(partnerName: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseApi}/api/orders/partner/${encodeURIComponent(partnerName)}`);
}

  recordDeliveryAttempt(orderId: string, reason: string): Observable<any> {
    const params = new HttpParams().set('reason', reason);
    return this.http.put<any>(`${this.baseApi}/api/orders/${orderId}/attempt-failed`, null, { params });
  }
}