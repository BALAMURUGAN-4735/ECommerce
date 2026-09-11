package com.example.order_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "DISTRIBUTION-SERVICE")
public interface DistributionClient {

    // 🚚 Automatically creates a shipment record in micro_distribution_db.shipments upon checkout
    @PostMapping("/distribution/dispatch")
    void initiateShipment(
            @RequestParam("orderId") String orderId,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "courierPartner", defaultValue = "BlueDart Express") String courierPartner,
            @RequestParam(value = "city", defaultValue = "N/A") String city,
            @RequestParam(value = "pincode", defaultValue = "N/A") String pincode
    );

    // 🚚 Syncs status changes (e.g. CANCELLED, PACKING, DISPATCHED) with distribution-service
    @PutMapping("/distribution/update/{orderId}")
    void updateShipmentStatus(
            @PathVariable("orderId") String orderId,
            @RequestParam("status") String status,
            @RequestParam(value = "courierPartner", required = false) String courierPartner
    );
}