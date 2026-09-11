package com.example.admin_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.admin_service.entity.AdminLog;
import com.example.admin_service.entity.RefundRecord;
import com.example.admin_service.repository.AdminRepository;
import com.example.admin_service.repository.RefundRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private RefundRepository refundRepository;

    // 📜 Log a new system audit action
    @PostMapping("/logs")
    public ResponseEntity<AdminLog> saveAuditLog(
            @RequestParam String username, 
            @RequestParam(defaultValue = "GENERAL") String module,
            @RequestParam String action,
            @RequestParam(defaultValue = "127.0.0.1") String ipAddress) {
        
        AdminLog log = new AdminLog(username, module, action, ipAddress);
        AdminLog savedLog = adminRepository.save(log);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLog);
    }

    // 📜 Retrieve all system audit logs
    @GetMapping("/logs")
    public List<AdminLog> getAllAuditLogs() {
        return adminRepository.findAll();
    }

    // 💳 Register a refund request (Called when an order is cancelled)
    @PostMapping("/refunds/request")
    public ResponseEntity<RefundRecord> createRefundRequest(
            @RequestParam String orderId,
            @RequestParam Long userId,
            @RequestParam double amount,
            @RequestParam String paymentMethod,
            @RequestParam String reason) {

        RefundRecord record = new RefundRecord(orderId, userId, amount, paymentMethod, reason);
        RefundRecord saved = refundRepository.save(record);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // 💳 Get all refund requests
    @GetMapping("/refunds")
    public List<RefundRecord> getAllRefunds() {
        return refundRepository.findAll();
    }

    // 💳 Approve & Process Refund
    @PutMapping("/refunds/{id}/approve")
    public ResponseEntity<?> approveRefund(@PathVariable Long id) {
        Optional<RefundRecord> opt = refundRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Refund record not found.");
        }

        RefundRecord refund = opt.get();
        refund.setStatus("PROCESSED");
        refund.setProcessedAt(LocalDateTime.now());
        refundRepository.save(refund);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Refund of ₹" + refund.getRefundAmount() + " processed successfully for Order #" + refund.getOrderId());
        return ResponseEntity.ok(response);
    }

    // 📊 Admin Dashboard Summary Metrics
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        List<RefundRecord> processedRefunds = refundRepository.findByStatus("PROCESSED");
        double totalRefundsAmount = processedRefunds.stream().mapToDouble(RefundRecord::getRefundAmount).sum();

        metrics.put("totalRefundsProcessed", totalRefundsAmount);
        metrics.put("pendingRefundsCount", refundRepository.findByStatus("PENDING").size());
        metrics.put("totalAuditLogs", adminRepository.count());

        return ResponseEntity.ok(metrics);
    }
}