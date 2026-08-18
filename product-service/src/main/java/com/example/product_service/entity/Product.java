package com.example.product_service.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {
    @Id
    private String id;
    private String name;
    private String description;
    private double price;
    private String imageUrl;
    
    // 🟢 NEW FIELDS FOR ADMIN CATALOG & STOCK MANAGEMENT
    private int stockQuantity;
    private String category;
    private String icon;
    private boolean isOutOfStock;

    // Constructors
    public Product() {
        this.stockQuantity = 10; // Default stock
        this.isOutOfStock = false;
    }

    public Product(String id, String name, String description, double price, String imageUrl, int stockQuantity, String category, String icon) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.stockQuantity = stockQuantity;
        this.category = category;
        this.icon = icon;
        this.isOutOfStock = stockQuantity <= 0;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { 
        this.stockQuantity = stockQuantity; 
        this.isOutOfStock = stockQuantity <= 0;
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public boolean isOutOfStock() { return isOutOfStock; }
    public void setOutOfStock(boolean outOfStock) { isOutOfStock = outOfStock; }
}