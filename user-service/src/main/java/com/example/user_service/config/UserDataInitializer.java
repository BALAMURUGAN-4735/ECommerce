package com.example.user_service.config;

import com.example.user_service.entity.CartFavorite;
import com.example.user_service.entity.User;
import com.example.user_service.repository.CartFavoriteRepository;
import com.example.user_service.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class UserDataInitializer {

    @Bean
    CommandLineRunner initUsersAndPreferences(UserRepository userRepo, CartFavoriteRepository cartFavRepo) {
        return args -> {
            if (userRepo.count() > 0) return;

            List<User> usersList = new ArrayList<>();

            // 🛡️ Admin Account
            User admin = new User("Administrator", "admin@gmail.com", "admin123");
            admin.setRole("admin");
            admin.setStatus("ACTIVE");
            usersList.add(admin);

            // 👥 5 Normal Active Customer Accounts
            User u1 = new User("Rahul Sharma", "rahul@gmail.com", "user123");
            User u2 = new User("Priya Patel", "priya@gmail.com", "user123");
            User u3 = new User("Arun Kumar", "arun@gmail.com", "user123");
            User u4 = new User("Sneha Reddy", "sneha@gmail.com", "user123");
            User u5 = new User("Karthik Raja", "karthik@gmail.com", "user123");
            usersList.addAll(List.of(u1, u2, u3, u4, u5));

            // 🚫 1 Blocked User Account
            User blockedUser = new User("Vikram Malhotra", "vikram@gmail.com", "user123");
            blockedUser.setRole("user");
            blockedUser.setStatus("BLOCKED");
            blockedUser.setBlockReason("Repeated fraudulent COD cancellations and dispute abuse.");
            usersList.add(blockedUser);

            // 🚚 3 Active Delivery Partners
            User dp1 = new User("BlueDart Logistics Agent", "bluedart@partner.com", "delivery123");
            dp1.setRole("delivery");
            dp1.setDeliveryPartner("BlueDart Express");
            usersList.add(dp1);

            User dp2 = new User("Delhivery Fleet Courier", "delhivery@partner.com", "delivery123");
            dp2.setRole("delivery");
            dp2.setDeliveryPartner("Delhivery Logistics");
            usersList.add(dp2);

            User dp3 = new User("In-House Delivery Agent", "inhouse@partner.com", "delivery123");
            dp3.setRole("delivery");
            dp3.setDeliveryPartner("In-House Delivery");
            usersList.add(dp3);

            // 🚫 1 Blocked Delivery Partner
            User dpBlocked = new User("CourierX Express Agent", "courierx@partner.com", "delivery123");
            dpBlocked.setRole("delivery");
            dpBlocked.setDeliveryPartner("CourierX Speed");
            dpBlocked.setStatus("BLOCKED");
            dpBlocked.setBlockReason("Repeated unauthorized delivery OTP bypass attempts and parcel damage reports.");
            usersList.add(dpBlocked);

            List<User> savedUsers = userRepo.saveAll(usersList);
            System.out.println("✅ [User-Service] Users & Delivery Partners seeded.");

            // 🛒 Populate 6 Favorites & 5 Cart Items for each Customer
            List<CartFavorite> preferences = new ArrayList<>();
            for (User u : savedUsers) {
                if ("user".equalsIgnoreCase(u.getRole())) {
                    Long uid = u.getId();

                    // 6 Distinct Favorite Items
                    preferences.add(new CartFavorite(uid, "PROD-E01", 1, "FAVORITE"));
                    preferences.add(new CartFavorite(uid, "PROD-M01", 1, "FAVORITE"));
                    preferences.add(new CartFavorite(uid, "PROD-H01", 1, "FAVORITE"));
                    preferences.add(new CartFavorite(uid, "PROD-D02", 1, "FAVORITE"));
                    preferences.add(new CartFavorite(uid, "PROD-S01", 1, "FAVORITE"));
                    preferences.add(new CartFavorite(uid, "PROD-ED01", 1, "FAVORITE"));

                    // 5 Distinct Cart Items
                    preferences.add(new CartFavorite(uid, "PROD-E05", 2, "CART"));
                    preferences.add(new CartFavorite(uid, "PROD-M03", 1, "CART"));
                    preferences.add(new CartFavorite(uid, "PROD-C03", 1, "CART"));
                    preferences.add(new CartFavorite(uid, "PROD-B01", 1, "CART"));
                    preferences.add(new CartFavorite(uid, "PROD-A04", 3, "CART"));
                }
            }

            cartFavRepo.saveAll(preferences);
            System.out.println("✅ [User-Service] Carts (5 items) and Favorites (6 items) initialized per user.");
        };
    }
}