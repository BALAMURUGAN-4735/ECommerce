package com.example.distribution_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.distribution_service.entity.Distribution;

import java.util.List;
import java.util.Optional;

@Repository
public interface DistributionRepository extends JpaRepository<Distribution, Long> {
    Optional<Distribution> findByOrderId(String orderId);
    List<Distribution> findByRecipientCityIgnoreCase(String recipientCity);
    List<Distribution> findByRecipientPincode(String recipientPincode);
    List<Distribution> findByStatus(String status);
}