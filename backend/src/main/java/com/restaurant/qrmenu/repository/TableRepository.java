package com.restaurant.qrmenu.repository;

import com.restaurant.qrmenu.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TableRepository extends JpaRepository<RestaurantTable, Long> {
    Optional<RestaurantTable> findByQrCode(String qrCode);

    Optional<RestaurantTable> findByIdAndActiveIsTrue(Long id);
} 