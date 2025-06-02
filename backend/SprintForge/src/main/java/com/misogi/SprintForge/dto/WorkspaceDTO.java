package com.misogi.SprintForge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
public class WorkspaceDTO {
    private Long id;

    @NotBlank(message = "Workspace name is required")
    @Size(min = 3, max = 50, message = "Workspace name must be between 3 and 50 characters")
    private String name;

    private String description;

//    @NotBlank(message = "Workspace owner is required")
//    private String owner;

    private Set<Long> members = new HashSet<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
}

@Data
class WorkspaceCreateRequest {
    @NotBlank(message = "Workspace name is required")
    @Size(min = 3, max = 50, message = "Workspace name must be between 3 and 50 characters")
    private String name;

    private String description;
    private Set<Long> members = new HashSet<>();
}

@Data
class WorkspaceUpdateRequest {
    @NotBlank(message = "Workspace name is required")
    @Size(min = 3, max = 50, message = "Workspace name must be between 3 and 50 characters")
    private String name;

    private String description;
    private Set<Long> members;
} 