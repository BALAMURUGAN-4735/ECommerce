package com.example.user_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.user_service.entity.CartFavorite;
import com.example.user_service.entity.User;
import com.example.user_service.repository.CartFavoriteRepository;
import com.example.user_service.repository.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@CrossOrigin
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartFavoriteRepository cartFavoriteRepository;

    @GetMapping("/cart-favorites-list/{userId}/{itemType}") 
    public ResponseEntity<?> getItemsPathVariable(
            @PathVariable("userId") Long userId, 
            @PathVariable("itemType") String itemType) {
        try {
            String cleanType = itemType.toUpperCase().trim();
            return ResponseEntity.ok(cartFavoriteRepository.findByUserIdAndItemType(userId, cleanType));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("DB Error: " + e.getMessage());
        }
    }

    @RequestMapping(value = "/get-items", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<?> fallbackGetItems(
            @RequestParam("userId") Long userId, 
            @RequestParam("itemType") String itemType) {
        try {
            return ResponseEntity.ok(cartFavoriteRepository.findByUserIdAndItemType(userId, itemType));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("DB Error: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> requestBody) {
        try {
            String name = requestBody.get("name");
            String email = requestBody.get("email");
            String password = requestBody.get("password");
            String role = requestBody.get("role"); 
            
            if (email == null || userRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is already registered or missing!");
            }
            
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(password);
            user.setRole(role != null && !role.trim().isEmpty() ? role.trim().toLowerCase() : "user"); 
            user.setStatus("ACTIVE"); 
            user.setDeliveryPartner(null); // 🟢 Default null upon registration
            
            User savedUser = userRepository.save(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/{id}/block")
    public ResponseEntity<?> blockUser(
            @PathVariable("id") Long id, 
            @RequestParam("reason") String reason) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        User user = userOpt.get();
        user.setStatus("BLOCKED");
        user.setBlockReason(reason);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User blocked successfully."));
    }

    @PutMapping("/{id}/unblock")
    public ResponseEntity<?> unblockUser(@PathVariable("id") Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        User user = userOpt.get();
        user.setStatus("ACTIVE");
        user.setBlockReason("");
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User unblocked successfully."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestParam String email, @RequestParam String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            User user = userOpt.get();
            
            if ("BLOCKED".equalsIgnoreCase(user.getStatus())) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "YOUR ACCOUNT IS BLOCKED BY ADMIN.");
                response.put("reason", user.getBlockReason() != null ? user.getBlockReason() : "Policy violation.");
                response.put("adminContact", "admin@gmail.com");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            return ResponseEntity.ok(user); 
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
    }

    @PostMapping("/sync-item")
    public ResponseEntity<?> syncItem(
            @RequestParam Long userId,
            @RequestParam String productId,
            @RequestParam int quantity,
            @RequestParam String itemType) {
        
        Optional<CartFavorite> existing = cartFavoriteRepository
                .findByUserIdAndProductIdAndItemType(userId, productId, itemType);

        if (existing.isPresent()) {
            CartFavorite item = existing.get();
            if ("CART".equalsIgnoreCase(itemType)) {
                item.setQuantity(quantity); 
            }
            return ResponseEntity.ok(cartFavoriteRepository.save(item));
        }

        CartFavorite newItem = new CartFavorite(userId, productId, quantity, itemType);
        return ResponseEntity.status(HttpStatus.CREATED).body(cartFavoriteRepository.save(newItem));
    }

    @DeleteMapping("/remove-item")
    @jakarta.transaction.Transactional
    public ResponseEntity<?> removeItem(
            @RequestParam Long userId,
            @RequestParam String productId,
            @RequestParam String itemType) {
        cartFavoriteRepository.deleteByUserIdAndProductIdAndItemType(userId, productId, itemType);
        return ResponseEntity.ok().body(Map.of("message", "Item removed successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable("id") Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }
    
    @PutMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestParam("email") String email, 
            @RequestParam("newPassword") String newPassword) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User email ID not found in database."));
            }

            User user = userOpt.get();
            user.setPassword(newPassword);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Password updated successfully! You can now log in."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to reset password: " + e.getMessage()));
        }
    }
}