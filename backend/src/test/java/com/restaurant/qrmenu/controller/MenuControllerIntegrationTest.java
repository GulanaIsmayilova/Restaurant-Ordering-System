package com.restaurant.qrmenu.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.restaurant.qrmenu.dto.MenuItemDTO;
import com.restaurant.qrmenu.entity.Category;
import com.restaurant.qrmenu.entity.MenuItem;
import com.restaurant.qrmenu.repository.CategoryRepository;
import com.restaurant.qrmenu.repository.MenuItemRepository;
import com.restaurant.qrmenu.repository.OrderItemRepository;
import com.restaurant.qrmenu.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MenuControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    private Category category;
    private MenuItem menuItem;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        orderItemRepository.deleteAll();
        menuItemRepository.deleteAll();
        categoryRepository.deleteAll();

        category = new Category();
        category.setName("Test Category");
        category = categoryRepository.save(category);

        menuItem = new MenuItem();
        menuItem.setName("Test Item");
        menuItem.setDescription("Test Description");
        menuItem.setPrice(new BigDecimal("10.00"));
        menuItem.setCategory(category);
        menuItem.setPreparationTime(15);
        menuItem.setActive(true);
        menuItem.setImageUrl("https://example.com/image.jpg");
        menuItem = menuItemRepository.save(menuItem);
    }

    @Test
    void getAllCategories_ShouldReturnAllCategories() throws Exception {
        mockMvc.perform(get("/api/menu/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Category"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createMenuItem_ShouldCreateNewMenuItem() throws Exception {
        MenuItemDTO request = new MenuItemDTO();
        request.setName("New Item");
        request.setDescription("New Description");
        request.setPrice(new BigDecimal("15.00"));
        request.setCategoryId(category.getId());
        request.setPreparationTime(20);
        request.setActive(true);
        request.setImageUrl("https://example.com/new-image.jpg");

        mockMvc.perform(post("/api/menu/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Item"))
                .andExpect(jsonPath("$.price").value(15.00));

        List<MenuItem> items = menuItemRepository.findAll();
        assertEquals(2, items.size());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateMenuItem_ShouldUpdateMenuItem() throws Exception {
        MenuItemDTO request = new MenuItemDTO();
        request.setName("Updated Item");
        request.setDescription("Updated Description");
        request.setPrice(new BigDecimal("20.00"));
        request.setCategoryId(category.getId());
        request.setPreparationTime(25);
        request.setActive(true);
        request.setImageUrl("https://example.com/updated-image.jpg");

        mockMvc.perform(put("/api/menu/items/{id}", menuItem.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Item"))
                .andExpect(jsonPath("$.price").value(20.00));

        MenuItem updatedItem = menuItemRepository.findById(menuItem.getId()).orElse(null);
        assertNotNull(updatedItem);
        assertEquals("Updated Item", updatedItem.getName());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteMenuItem_ShouldDeleteMenuItem() throws Exception {
        orderRepository.deleteAll();
        orderItemRepository.deleteAll();

        mockMvc.perform(delete("/api/menu/items/{id}", menuItem.getId()))
                .andExpect(status().isOk());

        List<MenuItem> items = menuItemRepository.findAll();
        assertEquals(1, items.size());
    }

    @Test
    void getAllMenuItems_ShouldReturnAllMenuItems() throws Exception {
        mockMvc.perform(get("/api/menu/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Item"));
    }


    @Test
    void getMenuItemById_ShouldReturnMenuItem() throws Exception {
        mockMvc.perform(get("/api/menu/items/{id}", menuItem.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Item"));
    }

    @Test
    void getMenuItemById_ShouldReturnNotFound_WhenMenuItemDoesNotExist() throws Exception {
        mockMvc.perform(get("/api/menu/items/{id}", 999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllMenuItemsForAdmin_ShouldReturnAllMenuItems() throws Exception {
        mockMvc.perform(get("/api/menu/admin/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Item"));
    }
} 