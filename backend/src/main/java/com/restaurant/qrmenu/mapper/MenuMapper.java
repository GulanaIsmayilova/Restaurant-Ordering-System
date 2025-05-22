package com.restaurant.qrmenu.mapper;

import com.restaurant.qrmenu.dto.CategoryDTO;
import com.restaurant.qrmenu.dto.MenuItemDTO;
import com.restaurant.qrmenu.entity.Category;
import com.restaurant.qrmenu.entity.MenuItem;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MenuMapper {

    public MenuItemDTO toDTO(MenuItem menuItem) {
        if (menuItem == null) {
            return null;
        }

        return MenuItemDTO.builder()
                .id(menuItem.getId())
                .name(menuItem.getName())
                .description(menuItem.getDescription())
                .price(menuItem.getPrice())
                .categoryId(menuItem.getCategory() != null ? menuItem.getCategory().getId() : null)
                .categoryName(menuItem.getCategory() != null ? menuItem.getCategory().getName() : null)
                .imageUrl(menuItem.getImageUrl())
                .active(menuItem.isActive())
                .preparationTime(menuItem.getPreparationTime())
                .build();
    }

    public CategoryDTO toDTO(Category category) {
        if (category == null) {
            return null;
        }

        List<MenuItemDTO> menuItemDTOs = category.getMenuItems() != null ?
                category.getMenuItems().stream()
                        .map(this::toDTO)
                        .toList() :
                null;

        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .active(category.isActive())
                .menuItems(menuItemDTOs)
                .build();
    }

    public List<MenuItemDTO> toMenuItemDTOList(List<MenuItem> menuItems) {
        if (menuItems == null) {
            return null;
        }
        return menuItems.stream()
                .map(this::toDTO)
                .toList();
    }

    public List<CategoryDTO> toCategoryDTOList(List<Category> categories) {
        if (categories == null) {
            return null;
        }
        return categories.stream()
                .map(this::toDTO)
                .toList();
    }
} 