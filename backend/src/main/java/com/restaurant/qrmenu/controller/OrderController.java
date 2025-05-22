package com.restaurant.qrmenu.controller;

import com.restaurant.qrmenu.dto.OrderMapper;
import com.restaurant.qrmenu.dto.OrderRequest;
import com.restaurant.qrmenu.dto.OrderResponse;
import com.restaurant.qrmenu.entity.Order;
import com.restaurant.qrmenu.entity.OrderStatus;
import com.restaurant.qrmenu.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor

public class OrderController {

    private final OrderService orderService;
    private final OrderMapper orderMapper;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest orderRequest) {
        Order order = orderMapper.toEntity(orderRequest);
        Order createdOrder = orderService.createOrder(order);
        return ResponseEntity.ok(orderMapper.toDto(createdOrder));
    }

    @PutMapping("/{id}/status")

    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        Order updatedOrder = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(orderMapper.toDto(updatedOrder));
    }


    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        Optional<Order> orderOpt = orderService.getOrderById(id);
        return orderOpt.map(order -> ResponseEntity.ok(orderMapper.toDto(order))).orElseGet(() -> ResponseEntity.notFound().build());
    }

}