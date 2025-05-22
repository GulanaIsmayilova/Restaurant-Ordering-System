package com.restaurant.qrmenu.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.restaurant.qrmenu.dto.OrderItemRequest;
import com.restaurant.qrmenu.dto.OrderRequest;
import com.restaurant.qrmenu.dto.OrderResponse;
import com.restaurant.qrmenu.entity.Order;
import com.restaurant.qrmenu.entity.OrderStatus;
import com.restaurant.qrmenu.entity.RestaurantTable;
import com.restaurant.qrmenu.repository.OrderRepository;
import com.restaurant.qrmenu.repository.TableRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TableRepository tableRepository;

    private RestaurantTable table;
    private Order order;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        tableRepository.deleteAll();

        table = new RestaurantTable();
        table.setTableNumber(1);
        table.setActive(true);
        table.setCapacity(4);
        table.setQrCode("QR123");
        table = tableRepository.save(table);

        order = new Order();
        order.setTable(table);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order = orderRepository.save(order);
    }


    @Test
    @WithMockUser(roles = "ADMIN")
    void updateOrderStatus_ShouldUpdateStatus() throws Exception {
        mockMvc.perform(put("/api/orders/{id}/status", order.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\": \"PREPARING\"}"));

        Order updatedOrder = orderRepository.findById(order.getId()).orElse(null);
        assertEquals(OrderStatus.PENDING, updatedOrder.getStatus());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateOrderStatus_ShouldReturnBadRequest_WhenInvalidStatus() throws Exception {
        mockMvc.perform(put("/api/orders/{id}/status", order.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\": \"INVALID_STATUS\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getOrderById_ShouldReturnOrder() throws Exception {
        mockMvc.perform(get("/api/orders/{id}", order.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(order.getId()))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void getOrderById_ShouldReturnNotFound_WhenOrderDoesNotExist() throws Exception {
        mockMvc.perform(get("/api/orders/{id}", 999L))
                .andExpect(status().isNotFound());
    }


} 