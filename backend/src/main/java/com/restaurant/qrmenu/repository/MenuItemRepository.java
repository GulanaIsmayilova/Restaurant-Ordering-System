package com.restaurant.qrmenu.repository;

import com.restaurant.qrmenu.entity.MenuItem;
import com.restaurant.qrmenu.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByCategoryAndActiveTrue(Category category);
    List<MenuItem> findByActiveTrue();
    Optional<MenuItem> findByName(String name);
    boolean existsByName(String name);
} 