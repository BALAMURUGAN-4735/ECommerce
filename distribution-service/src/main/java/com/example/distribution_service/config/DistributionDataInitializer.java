package com.example.distribution_service.config;

import com.example.distribution_service.entity.Distribution;
import com.example.distribution_service.repository.DistributionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class DistributionDataInitializer {

    @Bean
    CommandLineRunner initDistribution(DistributionRepository repository) {
        return args -> {
            if (repository.count() > 0) return;

            LocalDateTime now = LocalDateTime.now();
            List<Distribution> entries = new ArrayList<>();

            // 1. ORD-1001 - DELIVERED (Delivered yesterday)
            Distribution d1 = new Distribution("ORD-1001", 2L, "In-House Delivery", "TRK-INHOUSE-1001", "Chennai", "600002", "DELIVERED");
            d1.setCreatedAt(now.minusDays(4));
            d1.setDispatchedAt(now.minusDays(3));
            d1.setDeliveredAt(now.minusDays(1));
            d1.setEstimatedDelivery(now.minusDays(1));
            entries.add(d1);

            // 2. ORD-1002 - DISPATCHED (Expected tomorrow)
            Distribution d2 = new Distribution("ORD-1002", 2L, "BlueDart Express", "TRK-BLUEDART-8821", "Chennai", "600002", "DISPATCHED");
            d2.setCreatedAt(now.minusDays(2));
            d2.setDispatchedAt(now.minusDays(1));
            d2.setEstimatedDelivery(now.plusDays(1));
            entries.add(d2);

            // 3. ORD-1003 - WAITING_FOR_DELIVERY (Attempt 1 failed)
            Distribution d3 = new Distribution("ORD-1003", 2L, "In-House Delivery", "TRK-INHOUSE-1003", "Chennai", "600002", "WAITING_FOR_DELIVERY");
            d3.setCreatedAt(now.minusDays(1).minusHours(7));
            d3.setDispatchedAt(now.minusHours(10));
            d3.setEstimatedDelivery(now.plusDays(1));
            entries.add(d3);

            // 4. ORD-1004 - CANCELLED
            Distribution d4 = new Distribution("ORD-1004", 2L, "In-House Delivery", "TRK-INHOUSE-1004", "Chennai", "600002", "CANCELLED");
            d4.setCreatedAt(now.minusDays(3));
            entries.add(d4);

            // 5. ORD-1005 - DELIVERED
            Distribution d5 = new Distribution("ORD-1005", 2L, "Delhivery Logistics", "TRK-DEL-4412", "Chennai", "600002", "DELIVERED");
            d5.setCreatedAt(now.minusDays(5));
            d5.setDispatchedAt(now.minusDays(4));
            d5.setDeliveredAt(now.minusDays(2));
            d5.setEstimatedDelivery(now.minusDays(2));
            entries.add(d5);

            // 6. ORD-1006 - DELIVERED
            Distribution d6 = new Distribution("ORD-1006", 3L, "Delhivery Logistics", "TRK-DEL-4419", "Bangalore", "560001", "DELIVERED");
            d6.setCreatedAt(now.minusDays(6));
            d6.setDispatchedAt(now.minusDays(5));
            d6.setDeliveredAt(now.minusDays(3));
            d6.setEstimatedDelivery(now.minusDays(3));
            entries.add(d6);

            // 7. ORD-1007 - WAITING_FOR_DELIVERY (Attempt 2 failed)
            Distribution d7 = new Distribution("ORD-1007", 3L, "In-House Delivery", "TRK-INHOUSE-1007", "Bangalore", "560001", "WAITING_FOR_DELIVERY");
            d7.setCreatedAt(now.minusDays(2));
            d7.setDispatchedAt(now.minusDays(1));
            d7.setEstimatedDelivery(now.plusDays(2));
            entries.add(d7);

            // 8. ORD-1008 - DELIVERED
            Distribution d8 = new Distribution("ORD-1008", 3L, "In-House Delivery", "TRK-INHOUSE-1008", "Bangalore", "560001", "DELIVERED");
            d8.setCreatedAt(now.minusDays(3));
            d8.setDispatchedAt(now.minusDays(2));
            d8.setDeliveredAt(now.minusHours(8));
            d8.setEstimatedDelivery(now.minusHours(8));
            entries.add(d8);

            // 9. ORD-1009 - RTO
            Distribution d9 = new Distribution("ORD-1009", 3L, "BlueDart Express", "TRK-BLUEDART-9901", "Bangalore", "560001", "RTO");
            d9.setCreatedAt(now.minusDays(4));
            d9.setDispatchedAt(now.minusDays(3));
            d9.setEstimatedDelivery(now.minusDays(1));
            entries.add(d9);

            // 10. ORD-1010 - PACKING
            Distribution d10 = new Distribution("ORD-1010", 4L, "Delivery Partner Not Assigned Yet", "TRK-PENDING-1010", "Chennai", "600017", "PACKING");
            d10.setCreatedAt(now.minusHours(3));
            d10.setEstimatedDelivery(now.plusDays(4));
            entries.add(d10);

            // 11. ORD-1011 - DELIVERED
            Distribution d11 = new Distribution("ORD-1011", 4L, "In-House Delivery", "TRK-INHOUSE-1011", "Chennai", "600017", "DELIVERED");
            d11.setCreatedAt(now.minusDays(5));
            d11.setDispatchedAt(now.minusDays(4));
            d11.setDeliveredAt(now.minusDays(2));
            d11.setEstimatedDelivery(now.minusDays(2));
            entries.add(d11);

            // 12. ORD-1012 - DISPATCHED
            Distribution d12 = new Distribution("ORD-1012", 4L, "BlueDart Express", "TRK-BLUEDART-8899", "Chennai", "600017", "DISPATCHED");
            d12.setCreatedAt(now.minusDays(1));
            d12.setDispatchedAt(now.minusHours(8));
            d12.setEstimatedDelivery(now.plusDays(2));
            entries.add(d12);

            // 13. ORD-1013 - DELIVERED
            Distribution d13 = new Distribution("ORD-1013", 5L, "BlueDart Express", "TRK-BLUEDART-9011", "Hyderabad", "500033", "DELIVERED");
            d13.setCreatedAt(now.minusDays(2));
            d13.setDispatchedAt(now.minusDays(1));
            d13.setDeliveredAt(now.minusHours(4));
            d13.setEstimatedDelivery(now.minusHours(4));
            entries.add(d13);

            // 14. ORD-1014 - CANCELLED
            Distribution d14 = new Distribution("ORD-1014", 5L, "CourierX Speed", "TRK-CX-3311", "Hyderabad", "500033", "CANCELLED");
            d14.setCreatedAt(now.minusDays(2));
            entries.add(d14);

            // 15. ORD-1015 - DELIVERED
            Distribution d15 = new Distribution("ORD-1015", 6L, "In-House Delivery", "TRK-INHOUSE-1015", "Coimbatore", "641012", "DELIVERED");
            d15.setCreatedAt(now.minusDays(3));
            d15.setDispatchedAt(now.minusDays(2));
            d15.setDeliveredAt(now.minusHours(6));
            d15.setEstimatedDelivery(now.minusHours(6));
            entries.add(d15);

            repository.saveAll(entries);
            System.out.println("✅ [Distribution-Service] 15 Distribution tracking items successfully initialized.");
        };
    }
}