package com.misogi.SprintForge.service;

import com.misogi.SprintForge.dto.WorkspaceDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface WorkspaceService {
    WorkspaceDTO createWorkspace(WorkspaceDTO workspaceDTO);
    WorkspaceDTO updateWorkspace(Long id, WorkspaceDTO workspaceDTO);
    WorkspaceDTO getWorkspace(Long id);
    List<WorkspaceDTO> getWorkspacesByUser(Long userId);
    Page<WorkspaceDTO> getAllWorkspaces(Pageable pageable);
    void deleteWorkspace(Long id);
    void addMemberToWorkspace(Long id, Long userId);
    void removeMemberFromWorkspace(Long id, Long userId);
} 