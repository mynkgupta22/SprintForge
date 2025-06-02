package com.misogi.SprintForge.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

import lombok.Data;

@Data
public class TaskEmbeddingDTO {
    private String title;
    private String description;
    private String key;
    private String priority;
    private String status;
    private Integer storyPoints;
    private Integer estimate;
    private LocalDateTime dueDate;

    private AssigneeDTO assignee;
    private SprintDTO sprint;
    private ProjectDTO project;

    // DTOs for nested objects

    public static class AssigneeDTO {
        private Long id;
        private String name;
        private String email;
        private String role;

        public AssigneeDTO(Long id, String name, String email, String role) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
        }
        // Getters & Setters
        // ...
    }

    public static class SprintDTO {
        private Long id;
        private String name;
        private LocalDate startDate;
        private LocalDate endDate;
        private Boolean isActive;

        public SprintDTO(Long id, String name, LocalDate startDate, LocalDate endDate, Boolean isActive) {
            this.id = id;
            this.name = name;
            this.startDate = startDate;
            this.endDate = endDate;
            this.isActive = isActive;
        }
        // Getters & Setters
        // ...
    }

    public static class ProjectDTO {
        private Long id;
        private String name;
        private String key;
        private String description;
        private String type;

        public ProjectDTO(Long id, String name, String key, String description, String type) {
            this.id = id;
            this.name = name;
            this.key = key;
            this.description = description;
            this.type = type;
        }
        // Getters & Setters
        // ...
    }

    // Constructor
    public TaskEmbeddingDTO(String title, String description, String key, String priority, String status,
                            Integer storyPoints, Integer estimate, LocalDateTime dueDate,
                            AssigneeDTO assignee, SprintDTO sprint, ProjectDTO project) {
        this.title = title;
        this.description = description;
        this.key = key;
        this.priority = priority;
        this.status = status;
        this.storyPoints = storyPoints;
        this.estimate = estimate;
        this.dueDate = dueDate;
        this.assignee = assignee;
        this.sprint = sprint;
        this.project = project;
    }

    // Getters & Setters
    // ...
}

