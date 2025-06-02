package com.misogi.SprintForge.service.impl;

import com.misogi.SprintForge.config.JwtUtil;
import com.misogi.SprintForge.dto.AuthRequest;
import com.misogi.SprintForge.dto.AuthResponse;
import com.misogi.SprintForge.dto.UserDTO;
import com.misogi.SprintForge.exception.InvalidCredentialsException;
import com.misogi.SprintForge.model.User;
import com.misogi.SprintForge.repository.UserRepository;
import com.misogi.SprintForge.service.AuthService;
import com.misogi.SprintForge.service.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));
        if (!user.isEnabled() || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        String token = jwtUtil.generateToken(user.getEmail());
        UserDTO userDTO = mapToDTO(user);
        userDTO.setPassword(null); // Do not expose password
        return new AuthResponse(token, userDTO);
    }

    @Override
    public void logout(String token) {
        if (token != null && !token.isEmpty()) {
            tokenBlacklistService.blacklistToken(token);
        }
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRole(user.getRoles());
        dto.setEnabled(user.isEnabled());
        dto.setMobileNumber(user.getMobileNumber());
        if (user.getWorkspace() != null) {
            dto.setWorkspaceId(user.getWorkspace().getId());
            dto.setWorkspaceName(user.getWorkspace().getName());
        }
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
} 