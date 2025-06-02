package com.misogi.SprintForge.controller;

import com.misogi.SprintForge.dto.InviteDTO;
import com.misogi.SprintForge.enums.Role;
import com.misogi.SprintForge.service.InviteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/invites")
@RequiredArgsConstructor
public class InviteController {
    private final InviteService inviteService;

    @PostMapping
//    @PreAuthorize("hasRole('ADMIN') or hasRole('PM')")
    public ResponseEntity<?> createInvite(@RequestBody InviteDTO inviteDTO, Authentication authentication) {
        // Get current user role
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ADMIN"));
        boolean isPM = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("PM"));

        // Admin can invite PM or Developer
        // PM can only invite Developer
        if (isAdmin) {
            if (inviteDTO.getRole() == null || inviteDTO.getEmail() == null || inviteDTO.getWorkspaceId() == null) {
                return ResponseEntity.badRequest().body("Email, role, and workspaceId are required");
            }
            if (inviteDTO.getRole().name().equals("DEVELOPER")) {
                if (inviteDTO.getProjectIds() == null || inviteDTO.getProjectIds().isEmpty()) {
                    return ResponseEntity.badRequest().body("Project(s) must be selected for developer invite");
                }
            } else if (!inviteDTO.getRole().name().equals("PM")) {
                return ResponseEntity.badRequest().body("Admin can only invite PM or Developer");
            }
        } else if (isPM) {
            if (inviteDTO.getRole() == null || !inviteDTO.getRole().name().equals("DEVELOPER")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("PM can only invite Developer");
            }
            if (inviteDTO.getEmail() == null || inviteDTO.getWorkspaceId() == null || inviteDTO.getProjectIds() == null || inviteDTO.getProjectIds().isEmpty()) {
                return ResponseEntity.badRequest().body("Email, workspaceId, and project(s) are required for developer invite");
            }
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not authorized to invite");
        }
        InviteDTO created = inviteService.createInvite(inviteDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/pending")
    public ResponseEntity<InviteDTO> getPendingInviteByEmailAndRole(@RequestParam String email, @RequestParam Role role) {
        Optional<InviteDTO> invite = inviteService.getPendingInviteByEmailAndRole(email, role);
        return invite.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<Void> acceptInvite(@PathVariable Long id) {
        inviteService.acceptInvite(id);
        return ResponseEntity.ok().build();
    }
} 