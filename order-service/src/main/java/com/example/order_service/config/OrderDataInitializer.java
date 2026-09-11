package com.example.order_service.config;

import com.example.order_service.entity.Order;
import com.example.order_service.repository.OrderRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class OrderDataInitializer {

    @Bean
    CommandLineRunner initOrders(OrderRepository repository) {
        return args -> {
            if (repository.count() > 0) return;

            LocalDateTime now = LocalDateTime.now();
            List<Order> orders = new ArrayList<>();

            
            // 1. Delivered on 1st Attempt (4 Days Ago)
            Order o1 = new Order("ORD-1001", 2L, "PROD-E01,PROD-M03", "1,2", 5597.00, "DELIVERED", "Rahul Sharma", "9876543210", "12, Anna Salai, Chennai, TN - 600002", "UPI");
            o1.setCourierPartner("In-House Delivery");
            o1.setOrderDate(now.minusDays(4).minusHours(3));
            o1.setDeliveryAttempts(1);
            orders.add(o1);

            // 2. Dispatched (2 Days Ago, In Transit)
            Order o2 = new Order("ORD-1002", 2L, "PROD-H02", "1", 3799.00, "DISPATCHED", "Rahul Sharma", "9876543210", "12, Anna Salai, Chennai, TN - 600002", "CARD");
            o2.setCourierPartner("BlueDart Express");
            o2.setOrderDate(now.minusDays(2).minusHours(5));
            o2.setDeliveryAttempts(0);
            orders.add(o2);

            // 3. 1 Attempt Failed -> WAITING_FOR_DELIVERY (1 Day Ago)
            Order o3 = new Order("ORD-1003", 2L, "PROD-D01,PROD-D03", "2,1", 2897.00, "WAITING_FOR_DELIVERY", "Rahul Sharma", "9876543210", "12, Anna Salai, Chennai, TN - 600002", "COD");
            o3.setCourierPartner("In-House Delivery");
            o3.setOrderDate(now.minusDays(1).minusHours(7));
            o3.setDeliveryAttempts(1);
            o3.setCancelReason("Attempt 1 Failed: Customer door locked / premises closed");
            orders.add(o3);

            // 4. Cancelled by Customer (3 Days Ago)
            Order o4 = new Order("ORD-1004", 2L, "PROD-S01", "1", 899.00, "CANCELLED", "Rahul Sharma", "9876543210", "12, Anna Salai, Chennai, TN - 600002", "UPI");
            o4.setCourierPartner("In-House Delivery");
            o4.setOrderDate(now.minusDays(3).minusHours(2));
            o4.setDeliveryAttempts(0);
            o4.setCancelReason("Customer Requested Cancellation: Found better price locally");
            orders.add(o4);

            // 5. Delivered on 1st Attempt (5 Days Ago)
            Order o5 = new Order("ORD-1005", 2L, "PROD-ED01", "1", 750.00, "DELIVERED", "Rahul Sharma", "9876543210", "12, Anna Salai, Chennai, TN - 600002", "CARD");
            o5.setCourierPartner("Delhivery Logistics");
            o5.setOrderDate(now.minusDays(5).minusHours(4));
            o5.setDeliveryAttempts(1);
            orders.add(o5);

          
            // 6. Delivered on 1st Attempt (6 Days Ago)
            Order o6 = new Order("ORD-1006", 3L, "PROD-B01,PROD-B04", "1,2", 1597.00, "DELIVERED", "Priya Patel", "9840112233", "45, MG Road, Bangalore, KA - 560001", "UPI");
            o6.setCourierPartner("Delhivery Logistics");
            o6.setOrderDate(now.minusDays(6).minusHours(1));
            o6.setDeliveryAttempts(1);
            orders.add(o6);

            // 7. 2 Attempts Failed -> WAITING_FOR_DELIVERY (2 Days Ago)
            Order o7 = new Order("ORD-1007", 3L, "PROD-H01", "1", 6499.00, "WAITING_FOR_DELIVERY", "Priya Patel", "9840112233", "45, MG Road, Bangalore, KA - 560001", "CARD");
            o7.setCourierPartner("In-House Delivery");
            o7.setOrderDate(now.minusDays(2).minusHours(8));
            o7.setDeliveryAttempts(2);
            o7.setCancelReason("Attempt 2 Failed: Customer requested reschedule for weekend");
            orders.add(o7);

            // 8. Delivered on 1st Attempt (3 Days Ago)
            Order o8 = new Order("ORD-1008", 3L, "PROD-D02", "1", 1299.00, "DELIVERED", "Priya Patel", "9840112233", "45, MG Road, Bangalore, KA - 560001", "COD");
            o8.setCourierPartner("In-House Delivery");
            o8.setOrderDate(now.minusDays(3).minusHours(6));
            o8.setDeliveryAttempts(1);
            orders.add(o8);

            // 9. 3 Attempts Failed -> RTO (Return To Origin) (4 Days Ago)
            Order o9 = new Order("ORD-1009", 3L, "PROD-C01", "1", 1599.00, "RTO", "Priya Patel", "9840112233", "45, MG Road, Bangalore, KA - 560001", "COD");
            o9.setCourierPartner("BlueDart Express");
            o9.setOrderDate(now.minusDays(4).minusHours(9));
            o9.setDeliveryAttempts(3);
            o9.setCancelReason("RTO: 3 Failed Delivery Attempts. Customer unreachable on phone");
            orders.add(o9);

            // 10. Freshly Placed Order (3 Hours Ago)
            Order o10 = new Order("ORD-1010", 4L, "PROD-A01,PROD-A02", "1,1", 5398.00, "PLACED", "Arun Kumar", "9710334455", "78, T Nagar, Chennai, TN - 600017", "UPI");
            o10.setCourierPartner("Delivery Partner Not Assigned Yet");
            o10.setOrderDate(now.minusHours(3));
            o10.setDeliveryAttempts(0);
            orders.add(o10);

            // 11. Delivered on 1st Attempt (5 Days Ago)
            Order o11 = new Order("ORD-1011", 4L, "PROD-M01", "1", 32999.00, "DELIVERED", "Arun Kumar", "9710334455", "78, T Nagar, Chennai, TN - 600017", "CARD");
            o11.setCourierPartner("In-House Delivery");
            o11.setOrderDate(now.minusDays(5).minusHours(2));
            o11.setDeliveryAttempts(1);
            orders.add(o11);

            // 12. Dispatched (1 Day Ago)
            Order o12 = new Order("ORD-1012", 4L, "PROD-E02", "1", 1899.00, "DISPATCHED", "Arun Kumar", "9710334455", "78, T Nagar, Chennai, TN - 600017", "COD");
            o12.setCourierPartner("BlueDart Express");
            o12.setOrderDate(now.minusDays(1).minusHours(4));
            o12.setDeliveryAttempts(0);
            orders.add(o12);

            
            // 13. Delivered on 1st Attempt (2 Days Ago)
            Order o13 = new Order("ORD-1013", 5L, "PROD-T01,PROD-T03", "1,1", 2148.00, "DELIVERED", "Sneha Reddy", "9123456780", "19, Jubilee Hills, Hyderabad, TS - 500033", "UPI");
            o13.setCourierPartner("BlueDart Express");
            o13.setOrderDate(now.minusDays(2).minusHours(5));
            o13.setDeliveryAttempts(1);
            orders.add(o13);

            // 14. Cancelled by Customer (2 Days Ago)
            Order o14 = new Order("ORD-1014", 5L, "PROD-C04", "1", 1199.00, "CANCELLED", "Sneha Reddy", "9123456780", "19, Jubilee Hills, Hyderabad, TS - 500033", "CARD");
            o14.setCourierPartner("CourierX Speed");
            o14.setOrderDate(now.minusDays(2).minusHours(1));
            o14.setDeliveryAttempts(0);
            o14.setCancelReason("Accidental duplicate checkout by customer");
            orders.add(o14);

           
            // 15. Delivered on 1st Attempt (3 Days Ago)
            Order o15 = new Order("ORD-1015", 6L, "PROD-S04,PROD-S05", "1,2", 2597.00, "DELIVERED", "Karthik Raja", "9087654321", "88, Gandhipuram, Coimbatore, TN - 641012", "COD");
            o15.setCourierPartner("In-House Delivery");
            o15.setOrderDate(now.minusDays(3).minusHours(8));
            o15.setDeliveryAttempts(1);
            orders.add(o15);

            repository.saveAll(orders);
            System.out.println("✅ [Order-Service] 15 Diverse orders initialized with stepped dates and varied attempt counts.");
        };
    }
}