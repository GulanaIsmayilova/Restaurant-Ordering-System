package com.restaurant.qrmenu.service;

import com.restaurant.qrmenu.dto.auth.AuthResponse;
import com.restaurant.qrmenu.dto.auth.LoginRequest;
import com.restaurant.qrmenu.dto.auth.RegisterRequest;
import com.restaurant.qrmenu.entity.User;
import com.restaurant.qrmenu.entity.UserRole;
import com.restaurant.qrmenu.exception.UserNameAlreadyTakenException;
import com.restaurant.qrmenu.repository.UserRepository;
import com.restaurant.qrmenu.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User user;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private AuthResponse authResponse;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("testuser")
                .fullName("Test User")
                .password("encodedPassword")
                .role(UserRole.ROLE_WAITER)
                .build();

        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setFullName("Test User");
        registerRequest.setPassword("password123");
        registerRequest.setRole(UserRole.ROLE_WAITER);

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");

        authResponse = AuthResponse.builder()
                .token("jwtToken")
                .username("testuser")
                .role("ROLE_WAITER")
                .build();
    }

    @Test
    void register_ShouldReturnAuthResponse() {
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtService.generateToken(any(User.class))).thenReturn("jwtToken");

        AuthResponse result = authService.register(registerRequest);
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals("ROLE_WAITER", result.getRole());
        assertEquals("jwtToken", result.getToken());
    }

    @Test
    void register_ShouldThrowUserNameAlreadyTakenException() {
        when(userRepository.existsByUsername(anyString())).thenReturn(true);
        assertThrows(UserNameAlreadyTakenException.class, () -> authService.register(registerRequest));
    }

    @Test
    void login_ShouldReturnAuthResponse() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any(User.class))).thenReturn("jwtToken");

        AuthResponse result = authService.login(loginRequest);
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals("ROLE_WAITER", result.getRole());
        assertEquals("jwtToken", result.getToken());
    }

    @Test
    void login_ShouldThrowUsernameNotFoundException() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        assertThrows(UsernameNotFoundException.class, () -> authService.login(loginRequest));
    }
} 