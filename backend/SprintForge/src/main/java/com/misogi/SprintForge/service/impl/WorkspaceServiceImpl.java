package com.misogi.SprintForge.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.misogi.SprintForge.dto.WorkspaceDTO;
import com.misogi.SprintForge.exception.ResourceNotFoundException;
import com.misogi.SprintForge.model.User;
import com.misogi.SprintForge.model.Workspace;
import com.misogi.SprintForge.repository.UserRepository;
import com.misogi.SprintForge.repository.WorkspaceRepository;
import com.misogi.SprintForge.service.WorkspaceService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkspaceServiceImpl implements WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;

    @Override
    public WorkspaceDTO createWorkspace(WorkspaceDTO workspaceDTO) {
        Workspace workspace = mapToEntity(workspaceDTO);
        Workspace savedWorkspace = workspaceRepository.save(workspace);
        return mapToDTO(savedWorkspace);
    }

    @Override
    public WorkspaceDTO updateWorkspace(Long id, WorkspaceDTO workspaceDTO) {
        Workspace workspace = workspaceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", id));
        
        workspace.setName(workspaceDTO.getName());
        workspace.setDescription(workspaceDTO.getDescription());
        if (workspaceDTO.getMembers() != null) {
        	List<User> users = userRepository.findAllByIdIn(workspaceDTO.getMembers());
            workspace.setUsers(users);
        }
        
        Workspace updatedWorkspace = workspaceRepository.save(workspace);
        return mapToDTO(updatedWorkspace);
    }

    @Override
    public WorkspaceDTO getWorkspace(Long id) {
        Workspace workspace = workspaceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", id));
        return mapToDTO(workspace);
    }

    @Override
    public List<WorkspaceDTO> getWorkspacesByUser(Long userId) {
        return workspaceRepository.findWorkspacesByUserIdOrderByName(userId).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public Page<WorkspaceDTO> getAllWorkspaces(Pageable pageable) {
        return workspaceRepository.findAll(pageable).map(this::mapToDTO);
    }

    @Override
    public void deleteWorkspace(Long id) {
        Workspace workspace = workspaceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", id));
        workspaceRepository.delete(workspace);
    }

    @Override
    public void addMemberToWorkspace(Long id, Long userId) {
        Workspace workspace = workspaceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", id));
    	Optional<User> user = userRepository.findById(userId);

        workspace.getUsers().add(user.get());
        workspaceRepository.save(workspace);
    }

    @Override
    public void removeMemberFromWorkspace(Long id, Long userId) {
        Workspace workspace = workspaceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", id));
    	Optional<User> user = userRepository.findById(userId);
        workspace.getUsers().remove(user.get());
        workspaceRepository.save(workspace);
    }

    private Workspace mapToEntity(WorkspaceDTO dto) {
        Workspace workspace = new Workspace();
        workspace.setName(dto.getName());
        workspace.setDescription(dto.getDescription());
//        workspace.setOwner(dto.getOwner());
        List<User> users = userRepository.findAllByIdIn(dto.getMembers());
        workspace.setUsers(users);
        return workspace;
    }

    private WorkspaceDTO mapToDTO(Workspace workspace) {
        WorkspaceDTO dto = new WorkspaceDTO();
        dto.setId(workspace.getId());
        dto.setName(workspace.getName());
        dto.setDescription(workspace.getDescription());
//        dto.setOwner(workspace.getOwner());
        dto.setMembers(
        	    workspace.getUsers()
        	        .stream()
        	        .map(User::getId) // extract the ID from each User
        	        .collect(Collectors.toSet()) // collect to Set<Long>
        	);
        dto.setCreatedAt(workspace.getCreatedAt());
        dto.setUpdatedAt(workspace.getUpdatedAt());
        dto.setCreatedBy(workspace.getCreatedBy());
        dto.setUpdatedBy(workspace.getUpdatedBy());
        return dto;
    }
} 