package com.restaurant.qrmenu.config;

import com.restaurant.qrmenu.dto.CategoryDTO;
import com.restaurant.qrmenu.dto.MenuItemDTO;
import com.restaurant.qrmenu.entity.*;
import com.restaurant.qrmenu.repository.MenuItemRepository;
import com.restaurant.qrmenu.repository.OrderRepository;
import com.restaurant.qrmenu.repository.TableRepository;
import com.restaurant.qrmenu.repository.UserRepository;
import com.restaurant.qrmenu.service.MenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    @Value("${data.initializer.enabled:true}")
    private boolean dataInitializerEnabled;

    private final MenuService menuService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MenuItemRepository menuItemRepository;
    private final OrderRepository orderRepository;
    private final TableRepository tableRepository;

    @Bean
    @Transactional
    public CommandLineRunner initData() {
        return args -> {
            if (!dataInitializerEnabled) {
                log.info("Data initializer is disabled");
                return;
            }

            log.info("Checking menu data...");

            List<String> categoryNames = Arrays.asList("Appetizers", "Main Dishes", "Desserts", "Beverages");

            for (String categoryName : categoryNames) {
                if (!menuService.existsCategoryByName(categoryName)) {
                    Category category = new Category();
                    category.setName(categoryName);
                    category.setDescription(categoryName + " category");
                    CategoryDTO categoryDTO = menuService.createCategory(category);
                    log.info("Created new category: {}", categoryDTO.getName());
                }
            }

            List<MenuItemDTO> sampleItems = Arrays.asList(
                    createMenuItem("Caesar Salad", "Crispy romaine lettuce with Caesar dressing and croutons", new BigDecimal("8.50"), "Appetizers", 10),
                    createMenuItem("Spring Rolls", "Fried vegetable spring rolls with sweet chili sauce", new BigDecimal("7.00"), "Appetizers", 8),
                    createMenuItem("Margherita Pizza", "Classic Italian pizza with tomato, mozzarella, and basil", new BigDecimal("13.00"), "Main Dishes", 20),
                    createMenuItem("Cheeseburger", "Juicy grilled beef burger with cheese and fries", new BigDecimal("14.00"), "Main Dishes", 15),
                    createMenuItem("Sushi Platter", "Assorted sushi rolls with wasabi and soy sauce", new BigDecimal("18.50"), "Main Dishes", 25),
                    createMenuItem("Chocolate Lava Cake", "Warm chocolate cake with a gooey center", new BigDecimal("9.00"), "Desserts", 10),
                    createMenuItem("Tiramisu", "Layered Italian dessert with coffee and mascarpone", new BigDecimal("8.50"), "Desserts", 12),
                    createMenuItem("Coca-Cola", "Chilled can of Coca-Cola", new BigDecimal("3.00"), "Beverages", 2),
                    createMenuItem("Espresso", "Strong Italian espresso shot", new BigDecimal("4.00"), "Beverages", 3));

            for (MenuItemDTO item : sampleItems) {
                if (!menuService.existsMenuItemByName(item.getName())) {
                    menuService.createMenuItem(item);
                    log.info("Created new menu item: {}", item.getName());
                }
            }

            log.info("Menu data checked and updated.");
            init();
        };
    }

    public void init() {
        if (!dataInitializerEnabled) {
            return;
        }

        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(UserRole.ROLE_ADMIN);
            admin.setFullName("Admin");
            userRepository.save(admin);
        }

        if (userRepository.findByUsername("waiter1").isEmpty()) {
            User waiter1 = new User();
            waiter1.setUsername("waiter1");
            waiter1.setPassword(passwordEncoder.encode("waiter123"));
            waiter1.setRole(UserRole.ROLE_WAITER);
            waiter1.setFullName("John Smith");
            userRepository.save(waiter1);
        }

        if (userRepository.findByUsername("waiter2").isEmpty()) {
            User waiter2 = new User();
            waiter2.setUsername("waiter2");
            waiter2.setPassword(passwordEncoder.encode("waiter123"));
            waiter2.setRole(UserRole.ROLE_WAITER);
            waiter2.setFullName("Emma Johnson");
            userRepository.save(waiter2);
        }

        if (userRepository.findByUsername("kitchen1").isEmpty()) {
            User kitchen1 = new User();
            kitchen1.setUsername("kitchen1");
            kitchen1.setPassword(passwordEncoder.encode("kitchen123"));
            kitchen1.setRole(UserRole.ROLE_KITCHEN);
            kitchen1.setFullName("Michael Brown");
            userRepository.save(kitchen1);
        }

        if (tableRepository.count() == 0) {
            for (int i = 1; i <= 10; i++) {
                RestaurantTable table = new RestaurantTable();
                table.setId((long) i);
                table.setTableNumber(i);
                table.setCapacity(i <= 4 ? 4 : (i <= 7 ? 6 : 8));
                table.setQrCode("table-" + i + "-qr-code");
                tableRepository.save(table);
            }
        }

        if (orderRepository.count() == 0) {
            Order order1 = new Order();
            order1.setTable(tableRepository.findById(1L).get());
            order1.setStatus(OrderStatus.READY);
            order1.setCustomerNote("Please bring extra napkins");
            order1.setCreatedAt(LocalDateTime.now().minusMinutes(5));

            OrderItem item1 = new OrderItem();
            item1.setOrder(order1);
            item1.setMenuItem(menuItemRepository.findByName("Caesar Salad").get());
            item1.setQuantity(2);
            item1.setSpecialInstructions("Extra hot");
            item1.setUnitPrice(item1.getMenuItem().getPrice());

            OrderItem item2 = new OrderItem();
            item2.setOrder(order1);
            item2.setMenuItem(menuItemRepository.findByName("Margherita Pizza").get());
            item2.setQuantity(1);
            item2.setUnitPrice(item2.getMenuItem().getPrice());

            order1.setItems(Arrays.asList(item1, item2));
            orderRepository.save(order1);

            Order order2 = new Order();
            order2.setTable(tableRepository.findById(2L).get());
            order2.setStatus(OrderStatus.PREPARING);
            order2.setCreatedAt(LocalDateTime.now().minusMinutes(2));

            OrderItem item3 = new OrderItem();
            item3.setOrder(order2);
            item3.setMenuItem(menuItemRepository.findByName("Cheeseburger").get());
            item3.setQuantity(2);
            item3.setSpecialInstructions("No onions");
            item3.setUnitPrice(item3.getMenuItem().getPrice());

            OrderItem item4 = new OrderItem();
            item4.setOrder(order2);
            item4.setMenuItem(menuItemRepository.findByName("Sushi Platter").get());
            item4.setQuantity(1);
            item4.setUnitPrice(item4.getMenuItem().getPrice());

            order2.setItems(Arrays.asList(item3, item4));
            orderRepository.save(order2);

            Order order3 = new Order();
            order3.setTable(tableRepository.findById(3L).get());
            order3.setStatus(OrderStatus.READY);
            order3.setCustomerNote("Birthday celebration");
            order3.setCreatedAt(LocalDateTime.now().minusMinutes(10));

            OrderItem item5 = new OrderItem();
            item5.setOrder(order3);
            item5.setMenuItem(menuItemRepository.findByName("Tiramisu").get());
            item5.setQuantity(3);
            item5.setUnitPrice(item5.getMenuItem().getPrice());

            OrderItem item6 = new OrderItem();
            item6.setOrder(order3);
            item6.setMenuItem(menuItemRepository.findByName("Coca-Cola").get());
            item6.setQuantity(3);
            item6.setUnitPrice(item6.getMenuItem().getPrice());

            order3.setItems(Arrays.asList(item5, item6));
            orderRepository.save(order3);
        }
    }

    private MenuItemDTO createMenuItem(String name, String description, BigDecimal price, String categoryName, Integer preparationTime) {
        Category category = menuService.getCategoryByName(categoryName).orElseThrow(() -> new RuntimeException("Category not found: " + categoryName));

        MenuItemDTO item = new MenuItemDTO();
        item.setName(name);
        item.setDescription(description);
        item.setPrice(price);
        item.setCategoryId(category.getId());
        item.setPreparationTime(preparationTime);
        item.setActive(true);
        item.setImageUrl("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL7-RlcAbudVxAADRUxKdFhXCRRjMS4ItLXQ&s");
        return item;
    }
}
