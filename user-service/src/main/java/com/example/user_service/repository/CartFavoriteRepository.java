package com.example.user_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.user_service.entity.CartFavorite;

import java.util.List;
import java.util.Optional;

public interface CartFavoriteRepository extends JpaRepository<CartFavorite, Long> {
    List<CartFavorite> findByUserIdAndItemType(Long userId, String itemType);
    Optional<CartFavorite> findByUserIdAndProductIdAndItemType(Long userId, String productId, String itemType);
    void deleteByUserIdAndProductIdAndItemType(Long userId, String productId, String itemType);
}