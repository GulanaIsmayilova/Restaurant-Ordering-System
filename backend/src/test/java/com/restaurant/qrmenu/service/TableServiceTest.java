package com.restaurant.qrmenu.service;

import com.restaurant.qrmenu.entity.RestaurantTable;
import com.restaurant.qrmenu.repository.TableRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TableServiceTest {

    @Mock
    private TableRepository tableRepository;

    @InjectMocks
    private TableService tableService;

    private RestaurantTable table;

    @BeforeEach
    void setUp() {
        table = new RestaurantTable();
        table.setId(1L);
        table.setTableNumber(1);
        table.setActive(true);
    }

    @Test
    void getAllTables_ShouldReturnList() {
        when(tableRepository.findAll()).thenReturn(List.of(table));
        List<RestaurantTable> result = tableService.getAllTables();
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1, result.get(0).getTableNumber());
    }

    @Test
    void createTable_ShouldReturnTable() {
        when(tableRepository.save(any(RestaurantTable.class))).thenReturn(table);
        RestaurantTable result = tableService.createTable(table);
        assertNotNull(result);
        assertTrue(result.isActive());
        assertEquals(1, result.getTableNumber());
    }

    @Test
    void toggleTableActive_ShouldToggleActiveStatus() {
        when(tableRepository.findById(anyLong())).thenReturn(Optional.of(table));
        when(tableRepository.save(any(RestaurantTable.class))).thenReturn(table);

        RestaurantTable result = tableService.toggleTableActive(1L);
        assertNotNull(result);
        assertFalse(result.isActive());

        result = tableService.toggleTableActive(1L);
        assertNotNull(result);
        assertTrue(result.isActive());
    }

    @Test
    void toggleTableActive_ShouldThrowException_WhenTableNotFound() {
        when(tableRepository.findById(anyLong())).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> tableService.toggleTableActive(1L));
    }

    @Test
    void getTableByIdAndActive_ShouldReturnTable() {
        when(tableRepository.findByIdAndActiveIsTrue(anyLong())).thenReturn(Optional.of(table));
        RestaurantTable result = tableService.getTableByIdAndActive(1L);
        assertNotNull(result);
        assertTrue(result.isActive());
        assertEquals(1, result.getTableNumber());
    }

    @Test
    void getTableByIdAndActive_ShouldThrowException_WhenTableNotFound() {
        when(tableRepository.findByIdAndActiveIsTrue(anyLong())).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> tableService.getTableByIdAndActive(1L));
    }
} 