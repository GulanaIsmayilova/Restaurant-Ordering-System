package com.restaurant.qrmenu.service;

import com.restaurant.qrmenu.config.RabbitMQConfig;
import com.restaurant.qrmenu.dto.*;
import com.restaurant.qrmenu.entity.*;
import com.restaurant.qrmenu.repository.OrderRepository;
import com.restaurant.qrmenu.repository.TableRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private TableRepository tableRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Mock
    private OrderMapper orderMapper;

    @InjectMocks
    private OrderService orderService;

    private Order order;
    private RestaurantTable table;
    private OrderItem orderItem;
    private OrderRequest orderRequest;
    private OrderResponse orderResponse;

    @BeforeEach
    void setUp() {
        table = new RestaurantTable();
        table.setId(1L);
        table.setTableNumber(1);

        MenuItem menuItem = new MenuItem();
        menuItem.setId(1L);
        menuItem.setName("Test Item");
        menuItem.setPrice(new BigDecimal("10.00"));

        orderItem = new OrderItem();
        orderItem.setMenuItem(menuItem);
        orderItem.setQuantity(2);
        orderItem.setUnitPrice(new BigDecimal("10.00"));

        order = new Order();
        order.setId(1L);
        order.setTable(table);
        order.setStatus(OrderStatus.PENDING);
        order.setItems(Collections.singletonList(orderItem));

        orderRequest = new OrderRequest();
        orderRequest.setTableId(1L);
        orderRequest.setItems(Collections.singletonList(OrderItemRequest.builder()
                .menuItemId(1L)
                .quantity(2)
                .build()));

        orderResponse = OrderResponse.builder()
                .id(1L)
                .tableNumber(1)
                .status(OrderStatus.PENDING)
                .items(Collections.singletonList(new OrderItemResponse(1L, 1L, "Test Item", 2, new BigDecimal("10.00"), null)))
                .totalAmount(new BigDecimal("20.00"))
                .build();
    }

    @Test
    void getOrders_ShouldReturnAllOrders() {
        when(orderRepository.findAll()).thenReturn(Arrays.asList(order));

        List<Order> result = orderService.getAllOrders();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(orderRepository).findAll();
    }

    @Test
    void getOrderById_ShouldReturnOrder() {
        when(orderRepository.findById(anyLong())).thenReturn(Optional.of(order));

        Order result = orderService.getOrderById(1L).orElse(null);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(orderRepository).findById(1L);
    }

    @Test
    void updateOrderStatus_ShouldUpdateStatus() {
        when(orderRepository.findById(anyLong())).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(orderMapper.toDto(any(Order.class))).thenReturn(orderResponse);

        Order result = orderService.updateOrderStatus(1L, OrderStatus.READY);

        assertNotNull(result);
        assertEquals(OrderStatus.READY, result.getStatus());
        verify(orderRepository).save(any(Order.class));
        verify(rabbitTemplate).convertAndSend(eq(RabbitMQConfig.ORDER_EXCHANGE), eq(RabbitMQConfig.WAITER_ROUTING_KEY), any(OrderResponse.class));
    }

    @Test
    void updateOrderStatus_ShouldThrowException_WhenOrderNotFound() {
        when(orderRepository.findById(anyLong())).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> orderService.updateOrderStatus(1L, OrderStatus.PREPARING));
    }

    @Test
    void createOrder_ShouldCreateNewOrder() {
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(orderMapper.toDto(any(Order.class))).thenReturn(orderResponse);

        Order result = orderService.createOrder(order);

        assertNotNull(result);
        assertEquals(OrderStatus.PENDING, result.getStatus());
        assertEquals(1, result.getItems().size());
        verify(orderRepository).save(any(Order.class));
        verify(rabbitTemplate).convertAndSend(eq(RabbitMQConfig.ORDER_EXCHANGE), eq(RabbitMQConfig.ORDER_ROUTING_KEY_NEW), any(OrderResponse.class));
    }

    @Test
    void createOrder_ShouldThrowException_WhenTableNotFound() {
        when(tableRepository.findById(anyLong())).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> orderService.getOrdersByTable(1L));
    }

    @Test
    void getOrdersByTable_ShouldReturnOrders() {
        when(tableRepository.findById(anyLong())).thenReturn(Optional.of(table));
        when(orderRepository.findByTable(any(RestaurantTable.class))).thenReturn(Arrays.asList(order));

        List<Order> result = orderService.getOrdersByTable(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getTable().getId());
        verify(orderRepository).findByTable(any(RestaurantTable.class));
    }

    @Test
    void getOrdersForWaiter_ShouldReturnReadyOrders() {
        when(orderRepository.findByStatusIn(any())).thenReturn(Arrays.asList(order));
        when(orderMapper.toDto(any(Order.class))).thenReturn(orderResponse);
        
        List<OrderResponse> result = orderService.getOrdersForWaiter();
        
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(orderRepository).findByStatusIn(Collections.singletonList(OrderStatus.READY));
    }

    @Test
    void getOrdersForKitchen_ShouldReturnPendingAndPreparingOrders() {
        when(orderRepository.findByStatusIn(any())).thenReturn(Arrays.asList(order));
        when(orderMapper.toDto(any(Order.class))).thenReturn(orderResponse);
        
        List<OrderResponse> result = orderService.getOrdersForKitchen();
        
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(orderRepository).findByStatusIn(Arrays.asList(OrderStatus.PENDING, OrderStatus.PREPARING));
    }
} 