package com.misogi.SprintForge.dto;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.misogi.SprintForge.model.Task.TaskPriority;
import com.misogi.SprintForge.model.Task.TaskStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaskDTO {
    private Long id;
    
    @NotBlank(message = "Task title is required")
    private String title;
    
    private String description;
    
    private String key;
    
    private Long projectId;
    private String projectKey;
    private String projectName;
    
    private Long sprintId;
    private String sprintName;
    
    private Long assignee;
    
    private Set<String> tags = new HashSet<>();
    private TaskPriority priority = TaskPriority.MEDIUM;
    private TaskStatus status = TaskStatus.BACKLOG;
    
//    @NotNull(message = "Due date is required")
    private LocalDateTime dueDate;
    
    private Integer storyPoints = 0;
    private Integer estimate = 0;
    
    private Set<CommentDTO> comments = new HashSet<>();
    private Set<ActivityDTO> activities = new HashSet<>();
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
}

@Data
class TaskCreateRequest {
    @NotBlank(message = "Task title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Project ID is required")
    private Long projectId;
    
    private Long sprintId;
    
    @NotBlank(message = "Assignee is required")
    private String assignee;
    
    private Set<String> tags = new HashSet<>();
    private TaskPriority priority = TaskPriority.MEDIUM;
    
    @NotNull(message = "Due date is required")
    private LocalDateTime dueDate;
    
    private Integer storyPoints = 0;
    private Integer estimate = 0;
}

@Data
class TaskUpdateRequest {
    private String title;
    private String description;
    private Long sprintId;
    private Long assignee;
    private Set<String> tags;
    private TaskPriority priority;
    private TaskStatus status;
    private LocalDateTime dueDate;
    private Integer storyPoints;
    private Integer estimate;
}

@Data
class TaskStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private TaskStatus status;
} 
