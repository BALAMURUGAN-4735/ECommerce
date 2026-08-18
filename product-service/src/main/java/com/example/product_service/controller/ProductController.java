package com.example.product_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.product_service.entity.Product;
import com.example.product_service.repository.ProductRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/products")
@CrossOrigin
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // 🌐 User Catalog View (Lists All Products)
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // 🔍 Get Single Product
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ➕ Admin: Create New Product
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        if (product.getId() == null || product.getId().trim().isEmpty()) {
            product.setId("PROD-" + System.currentTimeMillis());
        }
        product.setOutOfStock(product.getStockQuantity() <= 0);
        Product savedProduct = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
    }

    // 🔄 Admin: Deduct Stock On Order Placement
    @PutMapping("/{id}/deduct-stock")
    public ResponseEntity<?> deductStock(@PathVariable String id, @RequestParam int quantity) {
        Optional<Product> opt = productRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found.");
        }

        Product p = opt.get();
        if (p.getStockQuantity() < quantity) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Insufficient stock available.");
        }

        p.setStockQuantity(p.getStockQuantity() - quantity);
        productRepository.save(p);

        Map<String, Object> res = new HashMap<>();
        res.put("message", "Stock deducted successfully.");
        res.put("remainingStock", p.getStockQuantity());
        res.put("isOutOfStock", p.isOutOfStock());
        return ResponseEntity.ok(res);
    }

    // 🔄 Admin / System: Restore Stock On Order Cancellation
    @PutMapping("/{id}/restore-stock")
    public ResponseEntity<?> restoreStock(@PathVariable String id, @RequestParam int quantity) {
        Optional<Product> opt = productRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found.");
        }

        Product p = opt.get();
        p.setStockQuantity(p.getStockQuantity() + quantity);
        productRepository.save(p);

        return ResponseEntity.ok("Stock restored successfully.");
    }

    // ⚠️ Admin Widget: Low Stock Alerts (< 5 items)
    @GetMapping("/alerts/low-stock")
    public List<Product> getLowStockAlerts() {
        return productRepository.findByStockQuantityLessThan(5);
    }

    // 🗑️ Admin: Delete Product
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(id);
        return ResponseEntity.ok("Product deleted successfully.");
    }
}