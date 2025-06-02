package com.misogi.SprintForge.controller;

import com.misogi.SprintForge.dto.WorkspaceDTO;
import com.misogi.SprintForge.service.WorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PM')")
    public ResponseEntity<WorkspaceDTO> createWorkspace(@Valid @RequestBody WorkspaceDTO workspaceDTO) {
        return new ResponseEntity<>(workspaceService.createWorkspace(workspaceDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PM')")
    public ResponseEntity<WorkspaceDTO> updateWorkspace(
            @PathVariable Long id,
            @Valid @RequestBody WorkspaceDTO workspaceDTO) {
        return ResponseEntity.ok(workspaceService.updateWorkspace(id, workspaceDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkspaceDTO> getWorkspace(@PathVariable Long id) {
        return ResponseEntity.ok(workspaceService.getWorkspace(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkspaceDTO>> getWorkspacesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(workspaceService.getWorkspacesByUser(userId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<WorkspaceDTO>> getAllWorkspaces(Pageable pageable) {
        return ResponseEntity.ok(workspaceService.getAllWorkspaces(pageable));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteWorkspace(@PathVariable Long id) {
        workspaceService.deleteWorkspace(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PM')")
    public ResponseEntity<Void> addMemberToWorkspace(
            @PathVariable Long id,
            @PathVariable Long userId) {
        workspaceService.addMemberToWorkspace(id, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PM')")
    public ResponseEntity<Void> removeMemberFromWorkspace(
            @PathVariable Long id,
            @PathVariable Long userId) {
        workspaceService.removeMemberFromWorkspace(id, userId);
        return ResponseEntity.ok().build();
    }
} 