package com.example.distribution_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "distributions") // 🟢 Fixed table name to match 'distributions'
public class Distribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderId;
    private Long userId;
    private String courierPartner; // e.g., BlueDart, Delhivery, Express
    private String trackingNumber;
    private String recipientCity;
    private String recipientPincode;
    
    private String status; // PLACED, PACKING, DISPATCHED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED

    private LocalDateTime createdAt;
    private LocalDateTime dispatchedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime estimatedDelivery;

    // Default Constructor
    public Distribution() {
        this.createdAt = LocalDateTime.now();
        this.estimatedDelivery = LocalDateTime.now().plusDays(4);
    }

    // Full Constructor
    public Distribution(String orderId, Long userId, String courierPartner, String trackingNumber, 
                        String recipientCity, String recipientPincode, String status) {
        this.orderId = orderId;
        this.userId = userId;
        this.courierPartner = courierPartner;
        this.trackingNumber = trackingNumber;
        this.recipientCity = recipientCity;
        this.recipientPincode = recipientPincode;
        this.status = status;
        this.createdAt = LocalDateTime.now();
        this.estimatedDelivery = LocalDateTime.now().plusDays(4);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCourierPartner() { return courierPartner; }
    public void setCourierPartner(String courierPartner) { this.courierPartner = courierPartner; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getRecipientCity() { return recipientCity; }
    public void setRecipientCity(String recipientCity) { this.recipientCity = recipientCity; }

    public String getRecipientPincode() { return recipientPincode; }
    public void setRecipientPincode(String recipientPincode) { this.recipientPincode = recipientPincode; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getDispatchedAt() { return dispatchedAt; }
    public void setDispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }

    public LocalDateTime getEstimatedDelivery() { return estimatedDelivery; }
    public void setEstimatedDelivery(LocalDateTime estimatedDelivery) { this.estimatedDelivery = estimatedDelivery; }
}