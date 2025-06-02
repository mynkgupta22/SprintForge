package com.misogi.SprintForge.service;

import com.misogi.SprintForge.dto.AuthRequest;
import com.misogi.SprintForge.dto.AuthResponse;

public interface AuthService {
    AuthResponse login(AuthRequest request);
    void logout(String token);
} 