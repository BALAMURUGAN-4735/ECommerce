package com.example.user_service.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;

    @Column(unique = true, nullable = false)
    private String email;
    
    private String password;
    
    @JsonProperty("role")
    private String role;
    
    @Column(name = "status")
    private String status = "ACTIVE"; // ACTIVE or BLOCKED

    @Column(name = "block_reason")
    private String blockReason;

    // 🟢 ADDED: Delivery Partner Column (Default null on registration)
    @Column(name = "delivery_partner")
    private String deliveryPartner = null;

    // Constructors
    public User() {}
    public User(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = "user";
        this.status = "ACTIVE";
        this.deliveryPartner = null; // Default null until SQL manual update
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getRole() { 
        if (this.role == null || this.role.trim().isEmpty()) {
            return "user";
        }
        return this.role; 
    }   
    public void setRole(String role) { this.role = role; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getBlockReason() { return blockReason; }
    public void setBlockReason(String blockReason) { this.blockReason = blockReason; }

    // 🟢 GETTER AND SETTER FOR DELIVERY PARTNER
    public String getDeliveryPartner() { return deliveryPartner; }
    public void setDeliveryPartner(String deliveryPartner) { this.deliveryPartner = deliveryPartner; }
}