package com.example.admin_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.admin_service.entity.RefundRecord;

import java.util.List;

@Repository
public interface RefundRepository extends JpaRepository<RefundRecord, Long> {
    List<RefundRecord> findByStatus(String status);
}