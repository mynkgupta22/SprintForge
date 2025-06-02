package com.misogi.SprintForge.service;

import com.misogi.SprintForge.dto.UserDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserDTO createUser(UserDTO userDTO);
    UserDTO updateUser(Long id, UserDTO userDTO);
    UserDTO getUserById(Long id);
    UserDTO getUserByUsername(String username);
    UserDTO getUserByEmail(String email);
    Page<UserDTO> getAllUsers(Pageable pageable);
    void deleteUser(Long id);
//    void changePassword(Long id, PasswordChangeRequest request);
    void enableUser(Long id);
    void disableUser(Long id);
} 