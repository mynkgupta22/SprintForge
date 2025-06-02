package com.misogi.SprintForge.dto;

import com.misogi.SprintForge.model.Project.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
public class ProjectDTO {
    private Long id;

    @NotBlank(message = "Project name is required")
    private String name;

    private String description;

    @NotBlank(message = "Project key is required")
    @Pattern(regexp = "^[A-Z][A-Z0-9]{1,9}$", message = "Project key must be 2-10 characters, start with a letter, and contain only uppercase letters and numbers")
    private String key;

    private Set<Long> members = new HashSet<>();
    private Set<Long> sprints = new HashSet<>();
    private SprintDTO activeSprint;
    private Set<TaskDTO> backlogTasks = new HashSet<>();
    private ProjectStatus status = ProjectStatus.ACTIVE;
    private Long workspaceId;
    private String workspaceName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
}

@Data
class ProjectCreateRequest {
    @NotBlank(message = "Project name is required")
    private String name;

    private String description;

    @NotBlank(message = "Project key is required")
    @Pattern(regexp = "^[A-Z][A-Z0-9]{1,9}$", message = "Project key must be 2-10 characters, start with a letter, and contain only uppercase letters and numbers")
    private String key;

    private Set<Long> memberIds = new HashSet<>();
    private Long workspaceId;
}

@Data
class ProjectUpdateRequest {
    private String name;
    private String description;
    private Set<Long> memberIds;
    private ProjectStatus status;
} 
