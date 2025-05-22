package com.restaurant.qrmenu.dto;

import com.restaurant.qrmenu.entity.MenuItem;
import com.restaurant.qrmenu.entity.Order;
import com.restaurant.qrmenu.entity.OrderItem;
import com.restaurant.qrmenu.entity.RestaurantTable;
import com.restaurant.qrmenu.repository.MenuItemRepository;
import com.restaurant.qrmenu.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final TableRepository tableRepository;
    private final MenuItemRepository menuItemRepository;

    public Order toEntity(OrderRequest orderRequest) {
        RestaurantTable table = tableRepository.findById(orderRequest.getTableId())
                .orElseThrow(() -> new RuntimeException("Table not found with number: " + orderRequest.getTableId()));

        Order order = new Order();
        order.setTable(table);
        order.setCustomerNote(orderRequest.getCustomerNote());

        // Add order items
        List<OrderItem> orderItems = new ArrayList<>();
        orderRequest.getItems().forEach(item -> {
            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(menuItemRepository.findById(item.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + item.getMenuItemId())));
            orderItem.setQuantity(item.getQuantity());
            orderItem.setOrder(order);
            orderItem.setUnitPrice(orderItem.getMenuItem().getPrice());
            orderItems.add(orderItem);
        });

        order.setItems(orderItems);
        return order;
    }

    public OrderResponse toDto(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        BigDecimal totalAmount = itemResponses.stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return OrderResponse.builder()
                .id(order.getId())
                .tableNumber(order.getTable().getTableNumber())
                .status(order.getStatus())
                .items(itemResponses)
                .totalAmount(totalAmount)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .customerNote(order.getCustomerNote())
                .build();
    }

    public List<OrderResponse> toDtoList(List<Order> orders) {
        return orders.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public OrderItem toEntity(OrderItemRequest orderItemRequest) {
        MenuItem menuItem = menuItemRepository.findById(orderItemRequest.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + orderItemRequest.getMenuItemId()));

        OrderItem orderItem = new OrderItem();
        orderItem.setMenuItem(menuItem);
        orderItem.setQuantity(orderItemRequest.getQuantity());
        orderItem.setSpecialInstructions(orderItemRequest.getSpecialInstructions());
        orderItem.setUnitPrice(menuItem.getPrice());

        return orderItem;
    }

    public OrderItemResponse toDto(OrderItem orderItem) {
        return OrderItemResponse.builder()
                .id(orderItem.getId())
                .menuItemId(orderItem.getMenuItem().getId())
                .menuItemName(orderItem.getMenuItem().getName())
                .quantity(orderItem.getQuantity())
                .unitPrice(orderItem.getUnitPrice())
                .specialInstructions(orderItem.getSpecialInstructions())
                .build();
    }
} 