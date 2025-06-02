package com.misogi.SprintForge.service.impl;

import com.misogi.SprintForge.dto.InviteDTO;
import com.misogi.SprintForge.enums.Role;
import com.misogi.SprintForge.model.Invite;
import com.misogi.SprintForge.model.Project;
import com.misogi.SprintForge.model.User;
import com.misogi.SprintForge.model.Workspace;
import com.misogi.SprintForge.repository.InviteRepository;
import com.misogi.SprintForge.repository.ProjectRepository;
import com.misogi.SprintForge.repository.UserRepository;
import com.misogi.SprintForge.repository.WorkspaceRepository;
import com.misogi.SprintForge.service.InviteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InviteServiceImpl implements InviteService {
    private final InviteRepository inviteRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Override
    public InviteDTO createInvite(InviteDTO dto) {
        Invite invite = new Invite();
        invite.setEmail(dto.getEmail());
        invite.setRole(dto.getRole());
        invite.setWorkspace(workspaceRepository.findById(dto.getWorkspaceId()).orElseThrow());
        if (dto.getProjectIds() != null && !dto.getProjectIds().isEmpty()) {
            Set<Project> projects = new HashSet<>(projectRepository.findAllById(dto.getProjectIds()));
            invite.setProjects(projects);
        }
        if (dto.getInvitedById() != null) {
            invite.setInvitedBy(userRepository.findById(dto.getInvitedById()).orElseThrow());
        }
        invite.setAccepted(false);
        Invite saved = inviteRepository.save(invite);
        return mapToDTO(saved);
    }

    @Override
    public Optional<InviteDTO> getPendingInviteByEmailAndRole(String email, Role role) {
        return inviteRepository.findByEmailAndRoleAndAcceptedFalse(email, role).map(this::mapToDTO);
    }

    @Override
    public void acceptInvite(Long inviteId) {
        Invite invite = inviteRepository.findById(inviteId).orElseThrow();
        invite.setAccepted(true);
        inviteRepository.save(invite);
    }

    private InviteDTO mapToDTO(Invite invite) {
        InviteDTO dto = new InviteDTO();
        dto.setId(invite.getId());
        dto.setEmail(invite.getEmail());
        dto.setRole(invite.getRole());
        dto.setWorkspaceId(invite.getWorkspace().getId());
        dto.setWorkspaceName(invite.getWorkspace().getName());
        dto.setProjectIds(invite.getProjects().stream().map(Project::getId).collect(Collectors.toSet()));
        dto.setInvitedById(invite.getInvitedBy() != null ? invite.getInvitedBy().getId() : null);
        dto.setAccepted(invite.isAccepted());
        dto.setCreatedAt(invite.getCreatedAt());
        dto.setUpdatedAt(invite.getUpdatedAt());
        return dto;
    }
} 