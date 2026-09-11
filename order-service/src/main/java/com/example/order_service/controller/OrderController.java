package com.example.order_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.order_service.client.AdminClient;
import com.example.order_service.client.DistributionClient;
import com.example.order_service.client.ProductClient;
import com.example.order_service.client.UserClient;
import com.example.order_service.dto.ProductDTO;
import com.example.order_service.entity.Order;
import com.example.order_service.repository.OrderRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
@CrossOrigin
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired(required = false)
    private ProductClient productClient;

    @Autowired(required = false)
    private UserClient userClient;

    @Autowired(required = false)
    private DistributionClient distributionClient;

    @Autowired(required = false)
    private AdminClient adminClient;

    private String generateFormattedOrderId() {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String unique6Digit = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        return "ORD-" + datePrefix + "-" + unique6Digit;
    }
    
    @PostMapping("/checkout")
    public ResponseEntity<?> placeOrder(
            @RequestParam("userId") Long userId, 
            @RequestParam("productId") String productId, 
            @RequestParam("quantity") String quantity,
            @RequestParam(value = "recipientName", required = false, defaultValue = "Valued Customer") String recipientName,
            @RequestParam(value = "recipientPhone", required = false, defaultValue = "N/A") String recipientPhone,
            @RequestParam(value = "address", required = false, defaultValue = "Standard Delivery Address") String address,
            @RequestParam(value = "paymentMethod", required = false, defaultValue = "CARD") String paymentMethod) {
        
        try {
            String[] productIds = productId.split(",");
            String[] quantities = quantity.split(",");
            
            double grandTotal = 0.0;

            for (int i = 0; i < productIds.length; i++) {
                String pId = productIds[i].trim();
                int qty = 1;
                if (i < quantities.length) {
                    try {
                        qty = Integer.parseInt(quantities[i].trim());
                    } catch (Exception e) {
                        qty = 1;
                    }
                }

                double productPrice = 299.99;
                if (productClient != null) {
                    try {
                        ProductDTO product = productClient.getProductById(pId);
                        if (product != null && product.getPrice() > 0) {
                            productPrice = product.getPrice();
                        }
                    } catch (Throwable ignored) {}
                }

                grandTotal += (productPrice * qty);

                if (productClient != null) {
                    try {
                        productClient.deductStock(pId, qty);
                    } catch (Throwable ignored) {}
                }
            }

            String generatedOrderId = generateFormattedOrderId();

            Order checkoutOrder = new Order(
                generatedOrderId, userId, productId, quantity, grandTotal, 
                "PLACED", recipientName, recipientPhone, address, paymentMethod
            );

            Order savedOrder = orderRepository.save(checkoutOrder);

            // 🟢 INITIAL SHIPMENT INITIATION WITH UNASSIGNED DELIVERY PARTNER DEFAULT
            if (distributionClient != null) {
                try {
                    distributionClient.initiateShipment(generatedOrderId, userId, "Delivery Partner Not Assigned Yet", "N/A", "N/A");
                } catch (Throwable ignored) {}
            }

            if (adminClient != null) {
                try {
                    adminClient.saveAuditLog(recipientName, "ORDER", "Placed Order #" + generatedOrderId, "127.0.0.1");
                } catch (Throwable ignored) {}
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);

        } catch (Throwable t) {
            t.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Checkout Execution Error: " + t.getMessage());
        }
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable String orderId, 
            @RequestBody Map<String, String> payload) {
        try {
            String reason = payload.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("A reason is mandatory for cancellation.");
            }

            Optional<Order> orderOpt = orderRepository.findByOrderId(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order entry not found.");
            }

            Order order = orderOpt.get();
            order.setStatus("CANCELLED");
            order.setCancelReason(reason.trim());
            orderRepository.save(order);

            if (distributionClient != null) {
                try {
                    distributionClient.updateShipmentStatus(orderId, "CANCELLED", null);
                } catch (Exception ignored) {}
            }

            Map<String, String> response = new HashMap<>();
            response.put("message", "Order successfully marked as CANCELLED.");
            return ResponseEntity.ok().body(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error executing cancellation process: " + e.getMessage());
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam("status") String newStatus,
            @RequestParam(value = "courierPartner", required = false) String courierPartner) {
        try {
            Optional<Order> orderOpt = orderRepository.findByOrderId(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found.");
            }

            Order order = orderOpt.get();
            order.setStatus(newStatus.toUpperCase().trim());
            
            // 🟢 CRITICAL FIX: Save assigned courier partner to Order entity
            if (courierPartner != null && !courierPartner.trim().isEmpty()) {
                order.setCourierPartner(courierPartner.trim());
            }

            orderRepository.save(order);

            // Sync with Distribution Service
            if (distributionClient != null) {
                try {
                    distributionClient.updateShipmentStatus(orderId, newStatus, courierPartner);
                } catch (Exception ignored) {}
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Status updated successfully.");
            response.put("currentStatus", order.getStatus());
            response.put("courierPartner", order.getCourierPartner());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Status update failed.");
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(orderRepository.findByUserId(userId));
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }
    
 // 🟢 RECORD ATTEMPT & AUTO-RTO LOGIC
    @PutMapping("/{orderId}/attempt-failed")
    public ResponseEntity<?> recordFailedAttempt(@PathVariable String orderId, @RequestParam("reason") String reason) {
        try {
            Optional<Order> orderOpt = orderRepository.findByOrderId(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found.");
            }

            Order order = orderOpt.get();
            int attempts = order.getDeliveryAttempts() + 1;
            order.setDeliveryAttempts(attempts);

            if (attempts >= 3) {
                order.setStatus("RTO");
                order.setCancelReason("RTO: 3 Failed Delivery Attempts. Note: " + reason);
            } else {
                order.setStatus("WAITING_FOR_DELIVERY");
                order.setCancelReason("Attempt " + attempts + " Failed: " + reason);
            }

            orderRepository.save(order);

            Map<String, Object> resp = new HashMap<>();
            resp.put("attempts", attempts);
            resp.put("status", order.getStatus());
            resp.put("message", order.getStatus().equals("RTO") ? "Order flagged as Return to Origin (RTO)" : "Delivery attempt logged.");
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Attempt logging failed.");
        }
    }
    
 // 🟢 FETCH ORDERS ASSIGNED TO A SPECIFIC DELIVERY PARTNER
    @GetMapping("/partner/{partnerName}")
    public ResponseEntity<List<Order>> getOrdersByCourierPartner(@PathVariable("partnerName") String partnerName) {
        try {
            List<Order> orders = orderRepository.findByCourierPartnerIgnoreCase(partnerName.trim());
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }
    }
}