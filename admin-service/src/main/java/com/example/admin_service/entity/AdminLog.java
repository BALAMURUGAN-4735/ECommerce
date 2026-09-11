package com.example.admin_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_audit_logs")
public class AdminLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String adminUsername;
    private String actionModule; // e.g., PRODUCT, ORDER, DISTRIBUTION, REFUND
    private String actionMessage;
    private String ipAddress;
    private LocalDateTime timestamp;

    public AdminLog() {
        this.timestamp = LocalDateTime.now();
    }

    public AdminLog(String adminUsername, String actionModule, String actionMessage, String ipAddress) {
        this.adminUsername = adminUsername;
        this.actionModule = actionModule;
        this.actionMessage = actionMessage;
        this.ipAddress = ipAddress;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAdminUsername() { return adminUsername; }
    public void setAdminUsername(String adminUsername) { this.adminUsername = adminUsername; }

    public String getActionModule() { return actionModule; }
    public void setActionModule(String actionModule) { this.actionModule = actionModule; }

    public String getActionMessage() { return actionMessage; }
    public void setActionMessage(String actionMessage) { this.actionMessage = actionMessage; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}