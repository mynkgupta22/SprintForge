package com.misogi.SprintForge.dto;

import com.misogi.SprintForge.enums.Role;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class InviteDTO {
    private Long id;
    private String email;
    private Role role;
    private Long workspaceId;
    private String workspaceName;
    private Set<Long> projectIds;
    private Long invitedById;
    private boolean accepted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 