package com.restaurant.qrmenu.service;


import com.restaurant.qrmenu.entity.RestaurantTable;
import com.restaurant.qrmenu.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class TableService {

    private final TableRepository tableRepository;


    public List<RestaurantTable> getAllTables() {
        return tableRepository.findAll();
    }

    public RestaurantTable createTable(RestaurantTable table) {
        table.setActive(true);
        return tableRepository.save(table);
    }


    public RestaurantTable toggleTableActive(Long id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Table not found"));

        table.setActive(!table.isActive());
        return tableRepository.save(table);
    }

    public RestaurantTable getTableByIdAndActive(Long id) {
        return tableRepository.findByIdAndActiveIsTrue(id)
                .orElseThrow(() -> new RuntimeException("Table not found or not active"));
    }

} 