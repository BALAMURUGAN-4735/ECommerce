package com.example.order_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.Random;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_id")
    private String orderId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "product_id", length = 1000)
    private String productId;

    @Column(name = "quantity", length = 1000)
    private String quantity;

    @Column(name = "total_bill")
    private double totalBill;

    @Column(name = "status")
    private String status;

    @Column(name = "cancel_reason")
    private String cancelReason;

    @Column(name = "courier_partner")
    private String courierPartner;

    @Column(name = "recipient_name")
    private String recipientName;

    @Column(name = "recipient_phone")
    private String recipientPhone;

    @Column(name = "shipping_address", length = 1000)
    private String shippingAddress;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "order_date")
    private LocalDateTime orderDate;

    // 🟢 OTP & DELIVERY ATTEMPTS
    @Column(name = "delivery_otp")
    private String deliveryOtp;

    @Column(name = "delivery_attempts")
    private int deliveryAttempts = 0;

    public Order() {
        this.orderDate = LocalDateTime.now();
        this.deliveryOtp = String.format("%04d", new Random().nextInt(10000));
    }

    public Order(String orderId, Long userId, String productId, String quantity, double totalBill, 
                 String status, String recipientName, String recipientPhone, 
                 String shippingAddress, String paymentMethod) {
        this.orderId = orderId;
        this.userId = userId;
        this.productId = productId;
        this.quantity = quantity;
        this.totalBill = totalBill;
        this.status = status;
        this.recipientName = recipientName;
        this.recipientPhone = recipientPhone;
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
        this.courierPartner = "Delivery Partner Not Assigned Yet";
        this.orderDate = LocalDateTime.now();
        this.deliveryOtp = String.format("%04d", new Random().nextInt(10000));
        this.deliveryAttempts = 0;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getQuantity() { return quantity; }
    public void setQuantity(String quantity) { this.quantity = quantity; }

    public double getTotalBill() { return totalBill; }
    public void setTotalBill(double totalBill) { this.totalBill = totalBill; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }

    public String getCourierPartner() { return courierPartner; }
    public void setCourierPartner(String courierPartner) { this.courierPartner = courierPartner; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getRecipientPhone() { return recipientPhone; }
    public void setRecipientPhone(String recipientPhone) { this.recipientPhone = recipientPhone; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public String getDeliveryOtp() { return deliveryOtp; }
    public void setDeliveryOtp(String deliveryOtp) { this.deliveryOtp = deliveryOtp; }

    public int getDeliveryAttempts() { return deliveryAttempts; }
    public void setDeliveryAttempts(int deliveryAttempts) { this.deliveryAttempts = deliveryAttempts; }
}