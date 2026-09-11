package com.example.admin_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_refunds")
public class RefundRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderId;
    private Long userId;
    private double refundAmount;
    private String paymentMethod; // CARD, UPI, COD
    private String cancellationReason;
    private String status; // PENDING, PROCESSED, REJECTED
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;

    public RefundRecord() {
        this.requestedAt = LocalDateTime.now();
        this.status = "PENDING";
    }

    public RefundRecord(String orderId, Long userId, double refundAmount, String paymentMethod, String cancellationReason) {
        this.orderId = orderId;
        this.userId = userId;
        this.refundAmount = refundAmount;
        this.paymentMethod = paymentMethod;
        this.cancellationReason = cancellationReason;
        this.status = "PENDING";
        this.requestedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public double getRefundAmount() { return refundAmount; }
    public void setRefundAmount(double refundAmount) { this.refundAmount = refundAmount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
}