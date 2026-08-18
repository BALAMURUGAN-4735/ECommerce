package com.example.distribution_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.distribution_service.entity.Distribution;
import com.example.distribution_service.repository.DistributionRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/distribution")
@CrossOrigin(origins = "*")
public class DistributionController {

    @Autowired
    private DistributionRepository repository;

    // 📦 Triggered when a new order needs fulfillment dispatch processing
    @PostMapping("/dispatch")
    public ResponseEntity<?> initiateShipment(
            @RequestParam String orderId, 
            @RequestParam Long userId,
            @RequestParam(defaultValue = "Delivery Partner Not Assigned Yet") String courierPartner,
            @RequestParam(defaultValue = "N/A") String city,
            @RequestParam(defaultValue = "N/A") String pincode) {
        
        try {
            String randomTracking = "TRK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Distribution shipment = new Distribution(orderId, userId, courierPartner, randomTracking, city, pincode, "PACKING");
            Distribution savedShipment = repository.save(shipment);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedShipment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error initiating shipment: " + e.getMessage());
        }
    }

    // 🔍 Get tracking history status for a specific order
    @GetMapping("/track/{orderId}")
    public ResponseEntity<?> getTrackingByOrder(@PathVariable String orderId) {
        Optional<Distribution> shipmentOpt = repository.findByOrderId(orderId);
        if (shipmentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tracking details not found for Order ID: " + orderId);
        }
        return ResponseEntity.ok(shipmentOpt.get());
    }

    // 🚚 Admin: Update Shipment Status Stage & Partner (Log Timestamps)
    @PutMapping("/update/{orderId}")
    public ResponseEntity<?> updateShipmentStatus(
            @PathVariable String orderId,
            @RequestParam String status,
            @RequestParam(required = false) String courierPartner) {
        
        try {
            Optional<Distribution> shipmentOpt = repository.findByOrderId(orderId);
            if (shipmentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Shipment record not found for Order ID: " + orderId);
            }

            Distribution shipment = shipmentOpt.get();
            shipment.setStatus(status.toUpperCase().trim());

            if (courierPartner != null && !courierPartner.trim().isEmpty()) {
                shipment.setCourierPartner(courierPartner.trim());
            }

            // Set timestamps based on delivery stage
            if ("DISPATCHED".equalsIgnoreCase(status)) {
                shipment.setDispatchedAt(LocalDateTime.now());
            } else if ("DELIVERED".equalsIgnoreCase(status)) {
                shipment.setDeliveredAt(LocalDateTime.now());
            }

            repository.save(shipment);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Shipment stage updated successfully.");
            response.put("orderId", orderId);
            response.put("newStatus", shipment.getStatus());
            response.put("courierPartner", shipment.getCourierPartner());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update shipment status: " + e.getMessage());
        }
    }

    // 📍 Admin: Filter shipments by City or Zip Code for bulk dispatching
    @GetMapping("/filter")
    public ResponseEntity<List<Distribution>> filterShipments(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String pincode) {
        
        if (city != null && !city.trim().isEmpty()) {
            return ResponseEntity.ok(repository.findByRecipientCityIgnoreCase(city.trim()));
        } else if (pincode != null && !pincode.trim().isEmpty()) {
            return ResponseEntity.ok(repository.findByRecipientPincode(pincode.trim()));
        }

        return ResponseEntity.ok(repository.findAll());
    }

    // 📋 Admin: Get All Shipments
    @GetMapping
    public ResponseEntity<List<Distribution>> getAllShipments() {
        return ResponseEntity.ok(repository.findAll());
    }
    
    // 🚚 Get all shipments assigned to a specific delivery partner
    @GetMapping("/partner/{partnerName}")
    public ResponseEntity<?> getOrdersByPartner(@PathVariable("partnerName") String partnerName) {
        try {
            List<Distribution> allShipments = repository.findAll();
            // Case-insensitive matching for partner name
            List<Distribution> partnerOrders = allShipments.stream()
                    .filter(d -> d.getCourierPartner() != null && 
                                 d.getCourierPartner().toLowerCase().contains(partnerName.toLowerCase().trim()))
                    .toList();
            return ResponseEntity.ok(partnerOrders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving partner shipments: " + e.getMessage());
        }
    }

    // 📦 Update shipment status from the delivery portal
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable("orderId") String orderId, 
            @RequestParam("status") String status) {
        try {
            Optional<Distribution> shipmentOpt = repository.findByOrderId(orderId);
            if (shipmentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Shipment not found for Order ID: " + orderId);
            }
            
            Distribution shipment = shipmentOpt.get();
            shipment.setStatus(status.toUpperCase().trim());
            
            if ("DISPATCHED".equalsIgnoreCase(status)) {
                shipment.setDispatchedAt(LocalDateTime.now());
            } else if ("DELIVERED".equalsIgnoreCase(status)) {
                shipment.setDeliveredAt(LocalDateTime.now());
            }
            
            repository.save(shipment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Order shipment status updated successfully to " + status.toUpperCase().trim());
            response.put("orderId", orderId);
            response.put("status", shipment.getStatus());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating status: " + e.getMessage());
        }
    }
}