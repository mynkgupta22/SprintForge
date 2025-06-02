package com.misogi.SprintForge.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.misogi.SprintForge.dto.ProjectDTO;
import com.misogi.SprintForge.dto.ProjectMemberDTO;
import com.misogi.SprintForge.service.ProjectService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PM')")
    public ResponseEntity<ProjectDTO> createProject(@Valid @RequestBody ProjectDTO projectDTO) {
        return new ResponseEntity<>(projectService.createProject(projectDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PM')")
    public ResponseEntity<ProjectDTO> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectDTO projectDTO) {
        return ResponseEntity.ok(projectService.updateProject(id, projectDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectByKey(id));
    }

    @GetMapping("/member/{userId}")
    public ResponseEntity<List<ProjectDTO>> getProjectsByMember(@PathVariable Long userId) {
        return ResponseEntity.ok(projectService.getProjectsByMember(userId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PM')")
    public ResponseEntity<Page<ProjectDTO>> getAllProjects(Pageable pageable) {
        return ResponseEntity.ok(projectService.getAllProjects(pageable));
    }

    @DeleteMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProject(@PathVariable String key) {
        projectService.deleteProject(key);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{key}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROJECT_MANAGER')")
    public ResponseEntity<Void> addMemberToProject(
            @PathVariable String key,
            @PathVariable Long userId) {
        projectService.addMemberToProject(key, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{key}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROJECT_MANAGER')")
    public ResponseEntity<Void> removeMemberFromProject(
            @PathVariable String key,
            @PathVariable Long userId) {
        projectService.removeMemberFromProject(key, userId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/member-detail/{projectId}")
    public ResponseEntity<ProjectMemberDTO> getProjectsMember(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProjectsMember(projectId));
    }
} 