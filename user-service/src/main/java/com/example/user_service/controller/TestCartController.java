package com.example.user_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.user_service.repository.CartFavoriteRepository;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class TestCartController {

    @Autowired
    private CartFavoriteRepository cartFavoriteRepository;

    // Direct, flat endpoint with NO class prefixes
    @GetMapping("/test-fetch-items")
    public ResponseEntity<?> getItems(
            @RequestParam Long userId, 
            @RequestParam String itemType) {
        try {
            return ResponseEntity.ok(cartFavoriteRepository.findByUserIdAndItemType(userId, itemType));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Database Error: " + e.getMessage());
        }
    }
}