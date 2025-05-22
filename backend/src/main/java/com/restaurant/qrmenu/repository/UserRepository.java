package com.restaurant.qrmenu.repository;

import com.restaurant.qrmenu.entity.User;
import com.restaurant.qrmenu.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    List<User> findByRoleIn(List<UserRole> roles);
} 