package com.restaurant.qrmenu.repository;

import com.restaurant.qrmenu.entity.OrderItem;
import com.restaurant.qrmenu.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder(Order order);
} 