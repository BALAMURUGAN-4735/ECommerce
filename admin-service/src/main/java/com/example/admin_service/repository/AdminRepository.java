package com.example.admin_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.admin_service.entity.AdminLog;

@Repository
public interface AdminRepository extends JpaRepository<AdminLog, Long> {
}