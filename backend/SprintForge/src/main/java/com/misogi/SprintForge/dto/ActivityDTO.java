package com.misogi.SprintForge.dto;

import com.misogi.SprintForge.model.Activity.ActivityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ActivityDTO {
    private Long id;

    @NotNull(message = "Activity type is required")
    private ActivityType type;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Actor is required")
    private Long actor;

    private Long taskId;
    private String taskKey;
    private String taskTitle;

    private String oldValue;
    private String newValue;

    private LocalDateTime createdAt;
    private Long createdBy;
}

@Data
class ActivityCreateRequest {
    @NotNull(message = "Activity type is required")
    private ActivityType type;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Actor is required")
    private Long actor;

    @NotNull(message = "Task ID is required")
    private Long taskId;

    private String oldValue;
    private String newValue;
} 