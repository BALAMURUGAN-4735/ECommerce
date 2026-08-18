package com.example.order_service.dto;

public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String deliveryPartner;
    private String status;

    public UserDTO() {}

    public UserDTO(Long id, String name, String email, String role, String deliveryPartner, String status) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.deliveryPartner = deliveryPartner;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDeliveryPartner() { return deliveryPartner; }
    public void setDeliveryPartner(String deliveryPartner) { this.deliveryPartner = deliveryPartner; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}