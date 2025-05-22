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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MenuServiceTest {
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private MenuItemRepository menuItemRepository;
    @Mock
    private MenuMapper menuMapper;
    @InjectMocks
    private MenuService menuService;

    private Category category;
    private MenuItem menuItem;
    private MenuItemDTO menuItemDTO;
    private CategoryDTO categoryDTO;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setName("Main");
        category.setActive(true);

        menuItem = new MenuItem();
        menuItem.setId(1L);
        menuItem.setName("Pizza");
        menuItem.setPrice(BigDecimal.TEN);
        menuItem.setCategory(category);
        menuItem.setActive(true);

        menuItemDTO = new MenuItemDTO();
        menuItemDTO.setId(1L);
        menuItemDTO.setName("Pizza");
        menuItemDTO.setPrice(BigDecimal.TEN);
        menuItemDTO.setCategoryId(1L);
        menuItemDTO.setActive(true);

        categoryDTO = new CategoryDTO();
        categoryDTO.setId(1L);
        categoryDTO.setName("Main");
        categoryDTO.setActive(true);
    }

    @Test
    void createCategory_ShouldReturnCategoryDTO() {
        when(categoryRepository.existsByName(anyString())).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenReturn(category);
        when(menuMapper.toDTO(any(Category.class))).thenReturn(categoryDTO);

        CategoryDTO result = menuService.createCategory(category);
        assertNotNull(result);
        assertEquals("Main", result.getName());
    }

    @Test
    void createCategory_ShouldThrowAlreadyExistException() {
        when(categoryRepository.existsByName(anyString())).thenReturn(true);
        assertThrows(AlreadyExistException.class, () -> menuService.createCategory(category));
    }

    @Test
    void getAllCategories_ShouldReturnList() {
        when(categoryRepository.findByActiveTrue()).thenReturn(List.of(category));
        when(menuMapper.toCategoryDTOList(anyList())).thenReturn(List.of(categoryDTO));
        List<CategoryDTO> result = menuService.getAllCategories();
        assertEquals(1, result.size());
    }

    @Test
    void createMenuItem_ShouldReturnMenuItemDTO() {
        when(menuItemRepository.existsByName(anyString())).thenReturn(false);
        when(categoryRepository.findById(anyLong())).thenReturn(Optional.of(category));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(menuItem);
        when(menuMapper.toDTO(any(MenuItem.class))).thenReturn(menuItemDTO);
        MenuItemDTO result = menuService.createMenuItem(menuItemDTO);
        assertNotNull(result);
        assertEquals("Pizza", result.getName());
    }

    @Test
    void createMenuItem_ShouldThrowAlreadyExistException() {
        when(menuItemRepository.existsByName(anyString())).thenReturn(true);
        assertThrows(AlreadyExistException.class, () -> menuService.createMenuItem(menuItemDTO));
    }

    @Test
    void updateMenuItem_ShouldReturnMenuItemDTO() {
        when(menuItemRepository.findById(anyLong())).thenReturn(Optional.of(menuItem));
        when(categoryRepository.findById(anyLong())).thenReturn(Optional.of(category));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(menuItem);
        when(menuMapper.toDTO(any(MenuItem.class))).thenReturn(menuItemDTO);
        MenuItemDTO result = menuService.updateMenuItem(1L, menuItemDTO);
        assertNotNull(result);
        assertEquals("Pizza", result.getName());
    }

    @Test
    void updateMenuItem_ShouldThrowNotFoundException() {
        when(menuItemRepository.findById(anyLong())).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> menuService.updateMenuItem(1L, menuItemDTO));
    }

    @Test
    void deleteMenuItem_ShouldSetInactive() {
        when(menuItemRepository.findById(anyLong())).thenReturn(Optional.of(menuItem));
        menuService.deleteMenuItem(1L);
        verify(menuItemRepository).save(any(MenuItem.class));
    }

    @Test
    void getAllMenuItems_ShouldReturnList() {
        when(menuItemRepository.findByActiveTrue()).thenReturn(List.of(menuItem));
        when(menuMapper.toMenuItemDTOList(anyList())).thenReturn(List.of(menuItemDTO));
        List<MenuItemDTO> result = menuService.getAllMenuItems();
        assertEquals(1, result.size());
    }

    @Test
    void getMenuItemsByCategory_ShouldReturnList() {
        when(categoryRepository.findById(anyLong())).thenReturn(Optional.of(category));
        when(menuItemRepository.findByCategoryAndActiveTrue(any(Category.class))).thenReturn(List.of(menuItem));
        when(menuMapper.toMenuItemDTOList(anyList())).thenReturn(List.of(menuItemDTO));
        List<MenuItemDTO> result = menuService.getMenuItemsByCategory(1L);
        assertEquals(1, result.size());
    }

    @Test
    void getMenuItemById_ShouldReturnOptional() {
        when(menuItemRepository.findById(anyLong())).thenReturn(Optional.of(menuItem));
        Optional<MenuItem> result = menuService.getMenuItemById(1L);
        assertTrue(result.isPresent());
    }

    @Test
    void existsCategoryByName_ShouldReturnTrue() {
        when(categoryRepository.existsByName(anyString())).thenReturn(true);
        assertTrue(menuService.existsCategoryByName("Main"));
    }

    @Test
    void getCategoryByName_ShouldReturnOptional() {
        when(categoryRepository.findByName(anyString())).thenReturn(Optional.of(category));
        Optional<Category> result = menuService.getCategoryByName("Main");
        assertTrue(result.isPresent());
    }

    @Test
    void existsMenuItemByName_ShouldReturnTrue() {
        when(menuItemRepository.existsByName(anyString())).thenReturn(true);
        assertTrue(menuService.existsMenuItemByName("Pizza"));
    }

    @Test
    void getAllMenuItemsForAdmin_ShouldReturnList() {
        when(menuItemRepository.findAll()).thenReturn(List.of(menuItem));
        when(menuMapper.toDTO(any(MenuItem.class))).thenReturn(menuItemDTO);
        List<MenuItemDTO> result = menuService.getAllMenuItemsForAdmin();
        assertEquals(1, result.size());
    }
} 