package com.misogi.SprintForge.service.impl;

import com.misogi.SprintForge.dto.UserDTO;
import com.misogi.SprintForge.exception.ResourceNotFoundException;
import com.misogi.SprintForge.model.User;
import com.misogi.SprintForge.model.Workspace;
import com.misogi.SprintForge.repository.UserRepository;
import com.misogi.SprintForge.repository.WorkspaceRepository;
import com.misogi.SprintForge.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.misogi.SprintForge.enums.Role;
import com.misogi.SprintForge.model.Invite;
import com.misogi.SprintForge.model.Project;
import com.misogi.SprintForge.repository.InviteRepository;
import com.misogi.SprintForge.repository.ProjectRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final PasswordEncoder passwordEncoder;
    private final InviteRepository inviteRepository;
    private final ProjectRepository projectRepository;

    @Override
    public UserDTO createUser(UserDTO userDTO) {
        // ADMIN: create workspace
        if (userDTO.getRole() == Role.ADMIN) {
            if (userDTO.getWorkspaceName() == null || userDTO.getWorkspaceName().isEmpty()) {
                throw new IllegalArgumentException("Workspace name is required for admin signup");
            }
            Workspace workspace = new Workspace();
            workspace.setName(userDTO.getWorkspaceName());
            workspace = workspaceRepository.save(workspace);
            User user = mapToEntity(userDTO);
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
            user.setWorkspace(workspace);
            user.setEnabled(true);
            User savedUser = userRepository.save(user);
            return mapToDTO(savedUser);
        }
        // PM or DEVELOPER: require invite
        Invite invite = inviteRepository.findByEmailAndRoleAndAcceptedFalse(userDTO.getEmail(), userDTO.getRole())
                .orElseThrow(() -> new IllegalArgumentException("No valid invite found for this email and role"));
        User user = mapToEntity(userDTO);
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setWorkspace(invite.getWorkspace());
        user.setEnabled(true);
        User savedUser = userRepository.save(user);
        // For developer, add to projects
        if (userDTO.getRole() == Role.DEVELOPER && invite.getProjects() != null) {
            for (Project project : invite.getProjects()) {
                project.getMembers().add(savedUser);
                projectRepository.save(project);
            }
        }
        // Mark invite as accepted
        invite.setAccepted(true);
        inviteRepository.save(invite);
        return mapToDTO(savedUser);
    }

    @Override
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
//        if (userDTO.getRoles() != null) {
//            user.setRoles(userDTO.getRoles());
//        }
        user.setEnabled(userDTO.isEnabled());
        
        if (userDTO.getWorkspaceId() != null) {
            Workspace workspace = workspaceRepository.findById(userDTO.getWorkspaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", userDTO.getWorkspaceId()));
            user.setWorkspace(workspace);
        }
        
        User updatedUser = userRepository.save(user);
        return mapToDTO(updatedUser);
    }

    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToDTO(user);
    }

    @Override
    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return mapToDTO(user);
    }

    @Override
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return mapToDTO(user);
    }

    @Override
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapToDTO);
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        userRepository.delete(user);
    }

//    @Override
//    public void changePassword(Long id, PasswordChangeRequest request) {
//        User user = userRepository.findById(id)
//            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
//        
//        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
//            throw new IllegalArgumentException("Current password is incorrect");
//        }
//        
//        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
//        userRepository.save(user);
//    }

    @Override
    public void enableUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setEnabled(true);
        userRepository.save(user);
    }

    @Override
    public void disableUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setEnabled(false);
        userRepository.save(user);
    }

    private User mapToEntity(UserDTO dto) {
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setRoles(dto.getRole());
        user.setEnabled(dto.isEnabled());
        user.setMobileNumber(dto.getMobileNumber());
        return user;
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