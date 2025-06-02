package com.misogi.SprintForge.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.misogi.SprintForge.dto.ProjectDTO;
import com.misogi.SprintForge.dto.ProjectMemberDTO;
import com.misogi.SprintForge.dto.ProjectSprintTaskDTO;


public interface ProjectService {
    ProjectDTO createProject(ProjectDTO projectDTO);
    ProjectDTO updateProject(Long key, ProjectDTO projectDTO);
    ProjectDTO getProjectByKey(Long key);
    List<ProjectDTO> getProjectsByMember(Long userId);
    Page<ProjectDTO> getAllProjects(Pageable pageable);
    void deleteProject(String key);
    void addMemberToProject(String key, Long userId);
    void removeMemberFromProject(String key, Long userId);
	ProjectMemberDTO getProjectsMember(Long projectId);
	ProjectSprintTaskDTO getProjectEmbedded(Long projectId);
} 