package com.restaurant.qrmenu.repository;

import com.restaurant.qrmenu.entity.Order;
import com.restaurant.qrmenu.entity.RestaurantTable;
import com.restaurant.qrmenu.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByTable(RestaurantTable table);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByTableAndStatus(RestaurantTable table, OrderStatus status);
    List<Order> findByStatusIn(List<OrderStatus> statuses);
} 