package com.example.user_service.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_saved_items")
public class CartFavorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String productId;
    private int quantity;
    
    // Type can be "CART" or "FAVORITE"
    private String itemType; 

    public CartFavorite() {}

    public CartFavorite(Long userId, String productId, int quantity, String itemType) {
        this.userId = userId;
        this.productId = productId;
        this.quantity = quantity;
        this.itemType = itemType;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }
}