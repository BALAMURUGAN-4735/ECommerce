package com.example.order_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.order_service.dto.ProductDTO;

@FeignClient(name = "PRODUCT-SERVICE") 
public interface ProductClient {

    // Ensure the path matches your ProductController mapping (e.g. /products/{id} or /api/products/{id})
    @GetMapping("/products/{id}")
    ProductDTO getProductById(@PathVariable("id") String id);
    
    // 🟢 Deduct stock when an order is placed
    @PutMapping("/products/{id}/deduct-stock")
    void deductStock(@PathVariable("id") String id, @RequestParam("quantity") int quantity);

    // 🟢 Restore stock when an order is cancelled
    @PutMapping("/products/{id}/restore-stock")
    void restoreStock(@PathVariable("id") String id, @RequestParam("quantity") int quantity);
}