package com.example.order_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "ADMIN-SERVICE")
public interface AdminClient {

    // 💳 Automatically generates a refund entry in micro_admin_db.admin_refunds when an order is cancelled
    @PostMapping("/admin/refunds/request")
    void createRefundRequest(
            @RequestParam("orderId") String orderId,
            @RequestParam("userId") Long userId,
            @RequestParam("amount") double amount,
            @RequestParam("paymentMethod") String paymentMethod,
            @RequestParam("reason") String reason
    );

    // 📜 System audit logger for order activities
    @PostMapping("/admin/logs")
    void saveAuditLog(
            @RequestParam("username") String username,
            @RequestParam("module") String module,
            @RequestParam("action") String action,
            @RequestParam(value = "ipAddress", defaultValue = "127.0.0.1") String ipAddress
    );
}