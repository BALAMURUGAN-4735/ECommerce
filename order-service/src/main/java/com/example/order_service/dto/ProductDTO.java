package com.example.order_service.dto;

//Data structure to hold product responses from product-service
public class ProductDTO {
    private String id;
    private String name;
    private double price;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
}