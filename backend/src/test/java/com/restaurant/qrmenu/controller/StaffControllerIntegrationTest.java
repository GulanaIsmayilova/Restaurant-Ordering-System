package com.restaurant.qrmenu.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.restaurant.qrmenu.dto.StaffDTO;
import com.restaurant.qrmenu.entity.User;
import com.restaurant.qrmenu.entity.UserRole;
import com.restaurant.qrmenu.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class StaffControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllStaff_ShouldReturnAllStaff() throws Exception {
        User staff1 = new User();
        staff1.setUsername("waiter1");
        staff1.setPassword(passwordEncoder.encode("password"));
        staff1.setFullName("John Doe");
        staff1.setRole(UserRole.ROLE_WAITER);
        userRepository.save(staff1);

        User staff2 = new User();
        staff2.setUsername("kitchen1");
        staff2.setPassword(passwordEncoder.encode("password"));
        staff2.setFullName("Jane Doe");
        staff2.setRole(UserRole.ROLE_KITCHEN);
        userRepository.save(staff2);

        mockMvc.perform(get("/api/staff-management/staff"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("waiter1"))
                .andExpect(jsonPath("$[1].username").value("kitchen1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createStaff_ShouldCreateNewStaff() throws Exception {
        StaffDTO request = new StaffDTO();
        request.setUsername("newstaff");
        request.setName("New Staff");
        request.setRole("ROLE_WAITER");
        request.setPassword("password123");

        mockMvc.perform(post("/api/staff-management/staff")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("newstaff"))
                .andExpect(jsonPath("$.name").value("New Staff"))
                .andExpect(jsonPath("$.role").value("ROLE_WAITER"));

        List<User> staff = userRepository.findAll();
        assertEquals(1, staff.size());
        assertEquals("newstaff", staff.get(0).getUsername());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateStaff_ShouldUpdateStaff() throws Exception {
        User staff = new User();
        staff.setUsername("waiter1");
        staff.setPassword(passwordEncoder.encode("password"));
        staff.setFullName("John Doe");
        staff.setRole(UserRole.ROLE_WAITER);
        staff = userRepository.save(staff);

        StaffDTO request = new StaffDTO();
        request.setUsername("updatedstaff");
        request.setName("Updated Staff");
        request.setRole("ROLE_KITCHEN");
        request.setPassword("newpassword");

        mockMvc.perform(put("/api/staff-management/staff/{staffId}", staff.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("updatedstaff"))
                .andExpect(jsonPath("$.name").value("Updated Staff"))
                .andExpect(jsonPath("$.role").value("ROLE_KITCHEN"));

        User updatedStaff = userRepository.findById(staff.getId()).orElse(null);
        assertNotNull(updatedStaff);
        assertEquals("updatedstaff", updatedStaff.getUsername());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteStaff_ShouldDeleteStaff() throws Exception {
        User staff = new User();
        staff.setUsername("waiter1");
        staff.setPassword(passwordEncoder.encode("password"));
        staff.setFullName("John Doe");
        staff.setRole(UserRole.ROLE_WAITER);
        staff = userRepository.save(staff);

        mockMvc.perform(delete("/api/staff-management/staff/{staffId}", staff.getId()))
                .andExpect(status().isOk());

        List<User> staffList = userRepository.findAll();
        assertEquals(0, staffList.size());
    }

    @Test
    @WithMockUser(roles = "WAITER")
    void getAllStaff_ShouldReturnForbidden_WhenNotAdmin() throws Exception {
        mockMvc.perform(get("/api/staff-management/staff"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "WAITER")
    void createStaff_ShouldReturnForbidden_WhenNotAdmin() throws Exception {
        StaffDTO request = new StaffDTO();
        request.setUsername("newstaff");
        request.setName("New Staff");
        request.setRole("ROLE_WAITER");
        request.setPassword("password123");

        mockMvc.perform(post("/api/staff-management/staff")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
} 