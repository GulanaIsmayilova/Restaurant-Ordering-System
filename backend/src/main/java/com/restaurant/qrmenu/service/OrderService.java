package com.restaurant.qrmenu.service;

import com.restaurant.qrmenu.config.RabbitMQConfig;
import com.restaurant.qrmenu.dto.OrderMapper;
import com.restaurant.qrmenu.dto.OrderResponse;
import com.restaurant.qrmenu.entity.Order;
import com.restaurant.qrmenu.entity.OrderStatus;
import com.restaurant.qrmenu.entity.RestaurantTable;
import com.restaurant.qrmenu.exception.NotFoundException;
import com.restaurant.qrmenu.repository.OrderItemRepository;
import com.restaurant.qrmenu.repository.OrderRepository;
import com.restaurant.qrmenu.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MenuService menuService;
    private final TableRepository tableRepository;
    private final OrderMapper orderMapper;
    private final RabbitTemplate rabbitTemplate;

    public Order createOrder(Order order) {
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        Order savedOrder = orderRepository.save(order);

        OrderResponse orderResponse = orderMapper.toDto(savedOrder);

        rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_EXCHANGE, RabbitMQConfig.ORDER_ROUTING_KEY_NEW, orderResponse);

        return savedOrder;
    }

    public Order updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new NotFoundException("Order not found"));

        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        Order updatedOrder = orderRepository.save(order);

        OrderResponse response = orderMapper.toDto(updatedOrder);

        if (status == OrderStatus.READY) {
            rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_EXCHANGE, RabbitMQConfig.WAITER_ROUTING_KEY, response);
        }

        return updatedOrder;
    }


    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByTable(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId).orElseThrow(() -> new RuntimeException("Table not found"));
        return orderRepository.findByTable(table);
    }


    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }


    public List<OrderResponse> getOrdersForWaiter() {
        return orderRepository.findByStatusIn(List.of(OrderStatus.READY)).stream().map(orderMapper::toDto).toList();
    }

    public List<OrderResponse> getOrdersForKitchen() {
        return orderRepository.findByStatusIn(List.of(OrderStatus.PENDING, OrderStatus.PREPARING)).stream().map(orderMapper::toDto).toList();
    }


}
