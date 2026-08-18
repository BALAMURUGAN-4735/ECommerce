package com.example.product_service.config;

import com.example.product_service.entity.Product;
import com.example.product_service.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class ProductDataInitializer {

    @Bean
    CommandLineRunner initProducts(ProductRepository repository) {
        return args -> {
            if (repository.count() > 0) return;

            List<Product> products = Arrays.asList(
                // 🎧 Electronics (5)
                new Product("PROD-E01", "Wireless Noise-Cancelling Headphones", "Over-ear bluetooth 5.3 headphones with ANC", 2999.00, "assets/images/prod1.jpg", 25, "Electronics", "🎧"),
                new Product("PROD-E02", "RGB Mechanical Gaming Keyboard", "Tactile blue switches with customizable backlight", 1899.00, "assets/images/prod2.jpg", 15, "Electronics", "⌨️"),
                new Product("PROD-E03", "4K Ultra-HD IPS Monitor 27-inch", "144Hz high refresh rate gaming display", 14999.00, "assets/images/prod3.jpg", 8, "Electronics", "🖥️"),
                new Product("PROD-E04", "Smart Fitness Tracker Band", "Continuous heart rate and SpO2 monitoring", 1499.00, "assets/images/prod4.jpg", 30, "Electronics", "⌚"),
                new Product("PROD-E05", "True Wireless Stereo Earbuds", "Deep bass with 36 hours total battery life", 999.00, "assets/images/prod5.jpg", 40, "Electronics", "🎧"),

                // 🏡 Home Appliances (5)
                new Product("PROD-H01", "Automatic Espresso Coffee Maker", "15-bar pump system with stainless milk frother", 6499.00, "assets/images/prod6.jpg", 12, "Home Appliances", "☕"),
                new Product("PROD-H02", "Digital Air Fryer 4.5L", "Rapid air circulation for oil-free cooking", 3799.00, "assets/images/prod7.jpg", 18, "Home Appliances", "🍳"),
                new Product("PROD-H03", "Robotic Vacuum Cleaner", "Laser navigation with auto mop and return dock", 18499.00, "assets/images/prod8.jpg", 5, "Home Appliances", "🤖"),
                new Product("PROD-H04", "Electric Cordless Water Kettle", "1.8L fast boil with auto-shutoff protection", 799.00, "assets/images/prod9.jpg", 35, "Home Appliances", "🫖"),
                new Product("PROD-H05", "Smart Air Purifier with HEPA Filter", "Removes 99.97% pollutants and allergens", 5999.00, "assets/images/prod10.jpg", 10, "Home Appliances", "💨"),

                // 📱 Mobiles (5)
                new Product("PROD-M01", "Flagship 5G Smartphone 256GB", "Snapdragon processor with 108MP camera system", 32999.00, "assets/images/prod11.jpg", 14, "Mobiles", "📱"),
                new Product("PROD-M02", "Budget 5G Smartphone 128GB", "5000mAh long-lasting battery with fast charging", 11499.00, "assets/images/prod12.jpg", 22, "Mobiles", "📱"),
                new Product("PROD-M03", "MagSafe Wireless Fast Charger", "15W magnetic induction charging pad", 1299.00, "assets/images/prod13.jpg", 50, "Mobiles", "🔋"),
                new Product("PROD-M04", "Shockproof Armor Phone Case", "Drop-tested protective casing with kickstand", 399.00, "assets/images/prod14.jpg", 4, "Mobiles", "🛡️"),
                new Product("PROD-M05", "Tempered Glass Screen Protector", "9H hardness ultra-clear scratch resistant glass", 199.00, "assets/images/prod15.jpg", 100, "Mobiles", "📱"),

                // 👗 Dress & Fashion (5)
                new Product("PROD-D01", "Slim-Fit Casual Denim Shirt", "100% breathable cotton washed blue shirt", 899.00, "assets/images/prod16.jpg", 28, "Dress & Fashion", "👔"),
                new Product("PROD-D02", "Embroidered Silk Ethnic Kurti", "Handcrafted traditional festival wear", 1299.00, "assets/images/prod17.jpg", 20, "Dress & Fashion", "👗"),
                new Product("PROD-D03", "Stretchable Chino Casual Trousers", "Comfort-fit formal and casual bottom wear", 1099.00, "assets/images/prod18.jpg", 24, "Dress & Fashion", "👖"),
                new Product("PROD-D04", "Winter Fleece Hooded Sweatshirt", "Warm thermal fabric with kangaroo pocket", 1499.00, "assets/images/prod19.jpg", 16, "Dress & Fashion", "🧥"),
                new Product("PROD-D05", "Genuine Leather Formal Belt", "Reversible classic buckle genuine leather belt", 599.00, "assets/images/prod20.jpg", 45, "Dress & Fashion", "👔"),

                // 🩺 Health Care (5)
                new Product("PROD-C01", "Digital Blood Pressure Monitor", "Fully automatic upper arm accurate BP gauge", 1599.00, "assets/images/prod21.jpg", 20, "Health Care", "🩺"),
                new Product("PROD-C02", "Infrared Non-Contact Forehead Thermometer", "1-second instant fever alert detection", 699.00, "assets/images/prod22.jpg", 30, "Health Care", "🌡️"),
                new Product("PROD-C03", "Finger Pulse Oximeter", "Measures blood oxygen saturation and pulse rate", 549.00, "assets/images/prod23.jpg", 35, "Health Care", "🩺"),
                new Product("PROD-C04", "Electric Sonic Toothbrush", "40,000 vibrations/min with replacement brush heads", 1199.00, "assets/images/prod24.jpg", 22, "Health Care", "🪥"),
                new Product("PROD-C05", "Orthopedic Memory Foam Seat Cushion", "Ergonomic tailbone pain relief support cushion", 899.00, "assets/images/prod25.jpg", 18, "Health Care", "🩺"),

                // 📚 Education (5)
                new Product("PROD-ED01", "Complete Java Full-Stack Guide Book", "Comprehensive guide to Spring Boot and Angular", 750.00, "assets/images/prod26.jpg", 40, "Education", "📚"),
                new Product("PROD-ED02", "Scientific Engineering Calculator", "Multi-line 417 functions matrix calculation tool", 1050.00, "assets/images/prod27.jpg", 25, "Education", "🧮"),
                new Product("PROD-ED03", "Adjustable Ergonomic Study Table Lamp", "Touch-dimmable warm and cool eye-care LED", 649.00, "assets/images/prod28.jpg", 30, "Education", "💡"),
                new Product("PROD-ED04", "Hardbound Ruled Diary & Executive Pen Set", "Premium writing stationary set", 499.00, "assets/images/prod29.jpg", 50, "Education", "🖊️"),
                new Product("PROD-ED05", "Digital Drawing & Graphic Stylus Tablet", "8192 levels pressure sensitivity for notes & art", 3199.00, "assets/images/prod30.jpg", 15, "Education", "✏️"),

                // 💄 Beauty (5)
                new Product("PROD-B01", "Hydrating Hyaluronic Face Serum 30ml", "Skin brightening and anti-aging daily serum", 599.00, "assets/images/prod31.jpg", 30, "Beauty", "💄"),
                new Product("PROD-B02", "Professional Matte Liquid Lipstick Set", "Long-lasting waterproof non-transfer 4-pack", 449.00, "assets/images/prod32.jpg", 40, "Beauty", "💄"),
                new Product("PROD-B03", "Deep Cleansing Organic Charcoal Face Wash", "Removes excess oil, dirt, and pollution", 299.00, "assets/images/prod33.jpg", 50, "Beauty", "🧴"),
                new Product("PROD-B04", "Vitamin C Radiance Glowing Moisturizer", "Lightweight daily day cream with SPF 30", 499.00, "assets/images/prod34.jpg", 35, "Beauty", "✨"),
                new Product("PROD-B05", "Professional Hair Dryer with Diffuser", "2000W salon style hot and cool wind blower", 1499.00, "assets/images/prod35.jpg", 20, "Beauty", "💇"),

                // ⚽ Sports (5)
                new Product("PROD-S01", "FIFA Match Standard Football Size 5", "Hand-stitched durable water-resistant ball", 899.00, "assets/images/prod36.jpg", 25, "Sports", "⚽"),
                new Product("PROD-S02", "High-Tension Carbon Badminton Racket", "Lightweight graphite racket with full cover", 1299.00, "assets/images/prod37.jpg", 20, "Sports", "🏸"),
                new Product("PROD-S03", "Non-Slip Eco-Friendly TPE Yoga Mat", "6mm extra-thick cushioned exercise mat", 699.00, "assets/images/prod38.jpg", 30, "Sports", "🧘"),
                new Product("PROD-S04", "Adjustable Hex Rubber Dumbbells (Pair 5kg)", "Cast iron anti-roll workout weight set", 1499.00, "assets/images/prod39.jpg", 15, "Sports", "🏋️"),
                new Product("PROD-S05", "Stainless Steel Insulated Sports Bottle 1L", "Keeps cold 24 hrs and hot 12 hrs leakproof", 549.00, "assets/images/prod40.jpg", 45, "Sports", "🥤"),

                // 🧸 Toys (5)
                new Product("PROD-T01", "Remote-Control High Speed Drift Car", "Rechargeable 2.4GHz racing vehicle toy", 1299.00, "assets/images/prod41.jpg", 20, "Toys", "🏎️"),
                new Product("PROD-T02", "STEM Robotics DIY Building Brick Set", "Creative learning building kit with 450+ parts", 999.00, "assets/images/prod42.jpg", 25, "Toys", "🧱"),
                new Product("PROD-T03", "Giant Plush Teddy Bear 3 Feet", "Ultra-soft cuddly companion stuffed toy", 849.00, "assets/images/prod43.jpg", 18, "Toys", "🧸"),
                new Product("PROD-T04", "Classic Family Strategy Board Game", "Interactive multiplayer property trading game", 599.00, "assets/images/prod44.jpg", 30, "Toys", "🎲"),
                new Product("PROD-T05", "Magnetic 3D Puzzle Cubes Set", "Brain teaser developmental fidget cube toy", 399.00, "assets/images/prod45.jpg", 50, "Toys", "🧩"),

                // 🚗 Automotive (5)
                new Product("PROD-A01", "High-Precision Digital Tyre Inflator", "150 PSI auto shut-off 12V portable compressor", 1899.00, "assets/images/prod46.jpg", 15, "Automotive", "🚗"),
                new Product("PROD-A02", "Dual Dash Cam Full HD Front and Rear", "Night vision with G-sensor parking monitor", 3499.00, "assets/images/prod47.jpg", 10, "Automotive", "📹"),
                new Product("PROD-A03", "Cordless High Power Car Vacuum Cleaner", "Wet/dry handheld rechargeable cleaner", 1199.00, "assets/images/prod48.jpg", 22, "Automotive", "🚗"),
                new Product("PROD-A04", "Universal Magnetic Dashboard Phone Mount", "360-degree rotation solid grip magnet", 349.00, "assets/images/prod49.jpg", 50, "Automotive", "📱"),
                new Product("PROD-A05", "Microfiber Car Cleaning Towels (Pack of 4)", "Super absorbent 800 GSM lint-free cloth", 399.00, "assets/images/prod50.jpg", 3, "Automotive", "🧽")
            );

            repository.saveAll(products);
            System.out.println("✅ [Product-Service] 50 Products successfully loaded across 10 categories.");
        };
    }
}