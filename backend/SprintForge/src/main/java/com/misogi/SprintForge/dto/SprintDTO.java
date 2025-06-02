package com.misogi.SprintForge.dto;

import com.misogi.SprintForge.model.Sprint.SprintStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
public class SprintDTO {
    private Long id;

    @NotBlank(message = "Sprint name is required")
    private String name;

    private String goal;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private Long projectId;
    private String projectKey;
    private String projectName;
    
    private Set<TaskDTO> tasks = new HashSet<>();
    private SprintStatus status = SprintStatus.PLANNED;
    private Integer capacity = 0;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
}

@Data
class SprintCreateRequest {
    @NotBlank(message = "Sprint name is required")
    private String name;

    private String goal;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Project ID is required")
    private Long projectId;
    
    private Integer capacity = 0;
}

@Data
class SprintUpdateRequest {
    private String name;
    private String goal;
    private LocalDate startDate;
    private LocalDate endDate;
    private SprintStatus status;
    private Integer capacity;
} 