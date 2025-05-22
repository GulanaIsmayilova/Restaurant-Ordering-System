package com.restaurant.qrmenu.service;

import com.restaurant.qrmenu.dto.StaffDTO;
import com.restaurant.qrmenu.entity.User;
import com.restaurant.qrmenu.entity.UserRole;
import com.restaurant.qrmenu.exception.NotFoundException;
import com.restaurant.qrmenu.exception.UserNameAlreadyTakenException;
import com.restaurant.qrmenu.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StaffServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private StaffService staffService;

    private User staff;
    private StaffDTO staffDTO;

    @BeforeEach
    void setUp() {
        staff = new User();
        staff.setId(1L);
        staff.setUsername("waiter1");
        staff.setFullName("John Doe");
        staff.setRole(UserRole.ROLE_WAITER);
        staff.setPassword("encodedPassword");

        staffDTO = new StaffDTO();
        staffDTO.setId(1L);
        staffDTO.setUsername("waiter1");
        staffDTO.setName("John Doe");
        staffDTO.setRole("ROLE_WAITER");
        staffDTO.setPassword("password123");
    }

    @Test
    void getAllStaff_ShouldReturnList() {
        when(userRepository.findByRoleIn(any())).thenReturn(Arrays.asList(staff));

        List<StaffDTO> result = staffService.getAllStaff();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("waiter1", result.get(0).getUsername());
        assertEquals("John Doe", result.get(0).getName());
        assertEquals("ROLE_WAITER", result.get(0).getRole());
        verify(userRepository).findByRoleIn(Arrays.asList(UserRole.ROLE_WAITER, UserRole.ROLE_KITCHEN));
    }

    @Test
    void createStaff_ShouldCreateNewStaff() {
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(staff);

        StaffDTO result = staffService.createStaff(staffDTO);

        assertNotNull(result);
        assertEquals("waiter1", result.getUsername());
        assertEquals("John Doe", result.getName());
        assertEquals("ROLE_WAITER", result.getRole());
        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode("password123");
    }

    @Test
    void createStaff_ShouldThrowException_WhenUsernameTaken() {
        when(userRepository.existsByUsername(anyString())).thenReturn(true);

        assertThrows(UserNameAlreadyTakenException.class, () -> staffService.createStaff(staffDTO));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void createStaff_ShouldThrowException_WhenPasswordEmpty() {
        staffDTO.setPassword("");
        assertThrows(RuntimeException.class, () -> staffService.createStaff(staffDTO));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateStaff_ShouldUpdateStaff() {
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(staff));
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(staff);

        StaffDTO updatedDTO = new StaffDTO();
        updatedDTO.setUsername("updateduser");
        updatedDTO.setName("Updated Name");
        updatedDTO.setRole("ROLE_KITCHEN");
        updatedDTO.setPassword("newPassword");

        StaffDTO result = staffService.updateStaff(1L, updatedDTO);

        assertNotNull(result);
        assertEquals("updateduser", result.getUsername());
        assertEquals("Updated Name", result.getName());
        assertEquals("ROLE_KITCHEN", result.getRole());
        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode("newPassword");
    }

    @Test
    void updateStaff_ShouldThrowException_WhenStaffNotFound() {
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> staffService.updateStaff(1L, staffDTO));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateStaff_ShouldThrowException_WhenUsernameTaken() {
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(staff));
        when(userRepository.existsByUsername(anyString())).thenReturn(true);

        StaffDTO updatedDTO = new StaffDTO();
        updatedDTO.setUsername("existinguser");

        assertThrows(UserNameAlreadyTakenException.class, () -> staffService.updateStaff(1L, updatedDTO));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void deleteStaff_ShouldDeleteStaff() {
        when(userRepository.existsById(anyLong())).thenReturn(true);
        doNothing().when(userRepository).deleteById(anyLong());

        staffService.deleteStaff(1L);

        verify(userRepository).deleteById(1L);
    }

    @Test
    void deleteStaff_ShouldThrowException_WhenStaffNotFound() {
        when(userRepository.existsById(anyLong())).thenReturn(false);

        assertThrows(NotFoundException.class, () -> staffService.deleteStaff(1L));
        verify(userRepository, never()).deleteById(anyLong());
    }
} 