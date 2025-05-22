package com.restaurant.qrmenu.dto;

import lombok.Data;

@Data
public class StaffDTO {
    private Long id;
    private String username;
    private String password;
    private String name;
    private String role;
} 