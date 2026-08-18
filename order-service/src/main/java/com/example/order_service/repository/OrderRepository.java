package com.example.order_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.order_service.entity.Order;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
	
    Optional<Order> findByOrderId(String orderId);
    
    List<Order> findByUserId(Long userId);

    // 🚚 Added to support the Delivery Portal partner filtering
    List<Order> findByCourierPartnerIgnoreCase(String courierPartner);
}