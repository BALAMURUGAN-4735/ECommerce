package com.example.admin_service.config;

import com.example.admin_service.entity.AdminLog;
import com.example.admin_service.entity.RefundRecord;
import com.example.admin_service.repository.AdminRepository;
import com.example.admin_service.repository.RefundRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Configuration
public class AdminDataInitializer {

    @Bean
    CommandLineRunner initAdminLogsAndRefunds(AdminRepository logRepo, RefundRepository refundRepo) {
        return args -> {
            if (logRepo.count() == 0) {
                List<AdminLog> logs = Arrays.asList(
                    new AdminLog("Administrator", "PRODUCT", "Added 50 catalog items across 10 retail departments", "127.0.0.1"),
                    new AdminLog("Administrator", "USER_MGMT", "Blocked user account vikram@gmail.com for fraudulent activity", "192.168.1.10"),
                    new AdminLog("Administrator", "USER_MGMT", "Blocked courier partner courierx@partner.com due to OTP validation bypass", "192.168.1.10"),
                    new AdminLog("Administrator", "DISTRIBUTION", "Dispatched Order #ORD-1002 via BlueDart Express", "127.0.0.1"),
                    new AdminLog("Administrator", "REFUND", "Processed instant UPI refund of ₹899 for cancelled Order #ORD-1004", "127.0.0.1"),
                    new AdminLog("In-House Delivery Agent", "DISTRIBUTION", "Verified 4-digit OTP and marked Order #ORD-1001 as DELIVERED", "10.122.0.14"),
                    new AdminLog("In-House Delivery Agent", "DISTRIBUTION", "Collected COD Cash of ₹1,299 for Order #ORD-1008", "10.122.0.14"),
                    new AdminLog("BlueDart Logistics Agent", "DISTRIBUTION", "Customer unreachable attempt logged for Order #ORD-1009", "10.122.0.22")
                );
                logRepo.saveAll(logs);
                System.out.println("✅ [Admin-Service] System audit logs populated.");
            }

            if (refundRepo.count() == 0) {
                RefundRecord r1 = new RefundRecord("ORD-1004", 2L, 899.00, "UPI", "Customer Requested Cancellation: Found better price locally");
                r1.setStatus("PROCESSED");
                r1.setProcessedAt(LocalDateTime.now().minusHours(2));

                RefundRecord r2 = new RefundRecord("ORD-1009", 3L, 1599.00, "COD", "Customer Unreachable on Phone after 3 delivery attempts");
                r2.setStatus("REJECTED"); // COD orders with no money collected are marked REJECTED / NO REFUND REQUIRED
                r2.setProcessedAt(LocalDateTime.now().minusHours(1));

                RefundRecord r3 = new RefundRecord("ORD-1014", 5L, 1199.00, "CARD", "Accidental duplicate checkout by customer");
                r3.setStatus("PENDING");

                refundRepo.saveAll(Arrays.asList(r1, r2, r3));
                System.out.println("✅ [Admin-Service] Refund records (PENDING, PROCESSED, REJECTED) initialized.");
            }
        };
    }
}