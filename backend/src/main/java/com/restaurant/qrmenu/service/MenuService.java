package com.restaurant.qrmenu.service;

import com.restaurant.qrmenu.dto.CategoryDTO;
import com.restaurant.qrmenu.dto.MenuItemDTO;
import com.restaurant.qrmenu.entity.Category;
import com.restaurant.qrmenu.entity.MenuItem;
import com.restaurant.qrmenu.exception.AlreadyExistException;
import com.restaurant.qrmenu.exception.NotFoundException;
import com.restaurant.qrmenu.mapper.MenuMapper;
import com.restaurant.qrmenu.repository.CategoryRepository;
import com.restaurant.qrmenu.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class MenuService {

    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuMapper menuMapper;

    public CategoryDTO createCategory(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new AlreadyExistException("Category name already exists");
        }
        Category savedCategory = categoryRepository.save(category);
        return menuMapper.toDTO(savedCategory);
    }

    public List<CategoryDTO> getAllCategories() {
        List<Category> categories = categoryRepository.findByActiveTrue();
        return menuMapper.toCategoryDTOList(categories);
    }


    public MenuItemDTO createMenuItem(MenuItemDTO dto) {
        if (menuItemRepository.existsByName(dto.getName())) {
            throw new AlreadyExistException("Menu item name already exists");
        }
        MenuItem savedMenuItem = new MenuItem();
        savedMenuItem.setName(dto.getName());
        savedMenuItem.setDescription(dto.getDescription());
        savedMenuItem.setPrice(dto.getPrice());
        savedMenuItem.setCategory(categoryRepository.findById(dto.getCategoryId()).orElseThrow(() -> new NotFoundException("Category not found")));
        savedMenuItem.setPreparationTime(dto.getPreparationTime());
        savedMenuItem.setImageUrl(dto.getImageUrl());


        savedMenuItem = menuItemRepository.save(savedMenuItem);
        return menuMapper.toDTO(savedMenuItem);
    }

    public MenuItemDTO updateMenuItem(Long id, MenuItemDTO menuItemDetails) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Menu item not found"));

        menuItem.setName(menuItemDetails.getName());
        menuItem.setDescription(menuItemDetails.getDescription());
        menuItem.setPrice(menuItemDetails.getPrice());
        menuItem.setCategory(categoryRepository.findById(menuItemDetails.getCategoryId()).orElseThrow(() -> new NotFoundException("Category not found")));
        menuItem.setImageUrl(menuItemDetails.getImageUrl());
        menuItem.setPreparationTime(menuItemDetails.getPreparationTime());
        menuItem.setActive(menuItemDetails.isActive());

        MenuItem updatedMenuItem = menuItemRepository.save(menuItem);
        return menuMapper.toDTO(updatedMenuItem);
    }

    public void deleteMenuItem(Long id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Menu item not found"));
        menuItem.setActive(false);
        menuItemRepository.save(menuItem);
    }

    public List<MenuItemDTO> getAllMenuItems() {
        List<MenuItem> menuItems = menuItemRepository.findByActiveTrue();
        return menuMapper.toMenuItemDTOList(menuItems);
    }

    public List<MenuItemDTO> getMenuItemsByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category not found"));
        List<MenuItem> menuItems = menuItemRepository.findByCategoryAndActiveTrue(category);
        return menuMapper.toMenuItemDTOList(menuItems);
    }

    public Optional<MenuItem> getMenuItemById(Long id) {
        return menuItemRepository.findById(id);
    }

    public boolean existsCategoryByName(String name) {
        return categoryRepository.existsByName(name);
    }

    public Optional<Category> getCategoryByName(String name) {
        return categoryRepository.findByName(name);
    }

    public boolean existsMenuItemByName(String name) {
        return menuItemRepository.existsByName(name);
    }

    public List<MenuItemDTO> getAllMenuItemsForAdmin() {
        return menuItemRepository.findAll().stream()
                .map(menuMapper::toDTO)
                .toList();
    }
} 