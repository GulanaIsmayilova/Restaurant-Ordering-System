package com.restaurant.qrmenu.controller;

import com.restaurant.qrmenu.dto.OrderMapper;
import com.restaurant.qrmenu.dto.OrderResponse;
import com.restaurant.qrmenu.entity.OrderStatus;
import com.restaurant.qrmenu.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kitchen")
@RequiredArgsConstructor
public class KitchenController {

    private final OrderService orderService;
    private final OrderMapper orderMapper;

    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN')")
    public ResponseEntity<List<OrderResponse>> getActiveOrders() {
        return ResponseEntity.ok(orderService.getOrdersForKitchen());
    }

    @PutMapping("/orders/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        if (status != OrderStatus.READY && status != OrderStatus.PREPARING) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(orderMapper.toDto(orderService.updateOrderStatus(id, status)));
    }
} 