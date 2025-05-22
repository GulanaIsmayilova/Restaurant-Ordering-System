package com.restaurant.qrmenu.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TableControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private OrderRepository orderRepository;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        tableRepository.deleteAll();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createTable_ShouldCreateNewTable() throws Exception {
        RestaurantTable table = new RestaurantTable();
        table.setTableNumber(1);
        table.setActive(true);
        table.setCapacity(4);
        table.setQrCode("QR123");

        mockMvc.perform(post("/api/tables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(table)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tableNumber").value(1))
                .andExpect(jsonPath("$.active").value(true))
                .andExpect(jsonPath("$.capacity").value(4))
                .andExpect(jsonPath("$.qrCode").value("QR123"));

        List<RestaurantTable> tables = tableRepository.findAll();
        assertEquals(1, tables.size());
        assertEquals(1, tables.get(0).getTableNumber());
        assertEquals(4, tables.get(0).getCapacity());
        assertEquals("QR123", tables.get(0).getQrCode());
    }

    @Test
    @WithMockUser(roles = "WAITER")
    void createTable_ShouldReturnForbidden_WhenNotAdmin() throws Exception {
        RestaurantTable table = new RestaurantTable();
        table.setTableNumber(1);
        table.setActive(true);
        table.setCapacity(4);
        table.setQrCode("QR123");

        mockMvc.perform(post("/api/tables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(table)))
                .andExpect(status().isForbidden());
    }

    @Test
    void getTableById_ShouldReturnTable() throws Exception {
        RestaurantTable table = new RestaurantTable();
        table.setTableNumber(1);
        table.setActive(true);
        table.setCapacity(4);
        table.setQrCode("QR123");
        table = tableRepository.save(table);

        mockMvc.perform(get("/api/tables/{id}", table.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    void getTableById_ShouldReturnNotFound_WhenTableDoesNotExist() throws Exception {
        mockMvc.perform(get("/api/tables/{id}", 999L))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAllTables_ShouldReturnAllTables() throws Exception {
        RestaurantTable table1 = new RestaurantTable();
        table1.setTableNumber(1);
        table1.setActive(true);
        table1.setCapacity(4);
        table1.setQrCode("QR123");
        tableRepository.save(table1);

        RestaurantTable table2 = new RestaurantTable();
        table2.setTableNumber(2);
        table2.setActive(true);
        table2.setCapacity(6);
        table2.setQrCode("QR456");
        tableRepository.save(table2);

        mockMvc.perform(get("/api/tables"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void toggleTableActive_ShouldToggleActiveStatus() throws Exception {
        RestaurantTable table = new RestaurantTable();
        table.setTableNumber(1);
        table.setActive(true);
        table.setCapacity(4);
        table.setQrCode("QR123");
        table = tableRepository.save(table);

        mockMvc.perform(put("/api/tables/{id}/toggle-active", table.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false))
                .andExpect(jsonPath("$.capacity").value(4))
                .andExpect(jsonPath("$.qrCode").value("QR123"));

        RestaurantTable updatedTable = tableRepository.findById(table.getId()).orElse(null);
        assertNotNull(updatedTable);
        assertFalse(updatedTable.isActive());
        assertEquals(4, updatedTable.getCapacity());
        assertEquals("QR123", updatedTable.getQrCode());
    }

    @Test
    @WithMockUser(roles = "WAITER")
    void toggleTableActive_ShouldReturnForbidden_WhenNotAdmin() throws Exception {
        RestaurantTable table = new RestaurantTable();
        table.setTableNumber(1);
        table.setActive(true);
        table.setCapacity(4);
        table.setQrCode("QR123");
        table = tableRepository.save(table);

        mockMvc.perform(put("/api/tables/{id}/toggle-active", table.getId()))
                .andExpect(status().isForbidden());
    }
} 