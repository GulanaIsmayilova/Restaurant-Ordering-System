package com.restaurant.qrmenu.service;

import com.restaurant.qrmenu.dto.StaffDTO;
import com.restaurant.qrmenu.entity.User;
import com.restaurant.qrmenu.entity.UserRole;
import com.restaurant.qrmenu.exception.NotFoundException;
import com.restaurant.qrmenu.exception.UserNameAlreadyTakenException;
import com.restaurant.qrmenu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<StaffDTO> getAllStaff() {
        return userRepository.findByRoleIn(List.of(UserRole.ROLE_WAITER, UserRole.ROLE_KITCHEN))
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public StaffDTO createStaff(StaffDTO staffDTO) {
        if (userRepository.existsByUsername(staffDTO.getUsername())) {
            throw new UserNameAlreadyTakenException("This username is already taken");
        }

        if (!StringUtils.hasText(staffDTO.getPassword())) {
            throw new RuntimeException("Password cannot be empty");
        }

        User staff = new User();
        staff.setUsername(staffDTO.getUsername());
        staff.setPassword(passwordEncoder.encode(staffDTO.getPassword()));
        staff.setFullName(staffDTO.getName());
        staff.setRole(UserRole.valueOf(staffDTO.getRole()));

        return convertToDTO(userRepository.save(staff));
    }

    public StaffDTO updateStaff(Long id, StaffDTO staffDTO) {
        User staff = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Staff not found"));

        if (!staff.getUsername().equals(staffDTO.getUsername()) &&
                userRepository.existsByUsername(staffDTO.getUsername())) {
            throw new UserNameAlreadyTakenException("This username is already taken");
        }

        staff.setUsername(staffDTO.getUsername());

        if (StringUtils.hasText(staffDTO.getPassword())) {
            staff.setPassword(passwordEncoder.encode(staffDTO.getPassword()));
        }

        staff.setFullName(staffDTO.getName());
        staff.setRole(UserRole.valueOf(staffDTO.getRole()));

        return convertToDTO(userRepository.save(staff));
    }

    public void deleteStaff(Long id) {
        if (!userRepository.existsById(id)) {
            throw new NotFoundException("Staff not found");
        }
        userRepository.deleteById(id);
    }

    private StaffDTO convertToDTO(User staff) {
        StaffDTO dto = new StaffDTO();
        dto.setId(staff.getId());
        dto.setUsername(staff.getUsername());
        dto.setName(staff.getFullName());
        dto.setRole(staff.getRole().name());
        return dto;
    }
}
