package com.restaurant.qrmenu.controller;

import com.restaurant.qrmenu.dto.OrderResponse;
import com.restaurant.qrmenu.entity.Order;
import com.restaurant.qrmenu.entity.OrderStatus;
import com.restaurant.qrmenu.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waiter")
@RequiredArgsConstructor
public class WaiterController {

    private final OrderService orderService;

    @GetMapping("/orders")
    @PreAuthorize("hasRole('WAITER')")
    public ResponseEntity<List<OrderResponse>> getWaiterOrders() {
        return ResponseEntity.ok(orderService.getOrdersForWaiter());
    }

    @PutMapping("/orders/{id}/deliver")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAITER')")
    public ResponseEntity<Order> markOrderAsDelivered(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, OrderStatus.DELIVERED));
    }
    @GetMapping("/tables/{tableId}/orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAITER')")
    public ResponseEntity<List<Order>> getTableOrders(@PathVariable Long tableId) {
        return ResponseEntity.ok(orderService.getOrdersByTable(tableId));
    }

} 