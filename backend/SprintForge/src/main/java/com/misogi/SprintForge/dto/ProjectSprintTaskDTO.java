package com.misogi.SprintForge.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class ProjectSprintTaskDTO {
    private Long projectId;
    private String projectName;
    private String projectKey;
    private String projectDescription;

    private List<SprintsDto> sprints;
    private List<TasksDto> backlogTasks;

    // DTOs

    @Data
    public static class SprintsDto {
        private Long sprintId;
        private String sprintName;
        private String sprintGoal;
        private LocalDate sprintStartDate;
        private LocalDate sprintEndDate;
        private String sprintStatus;

        private List<TasksDto> tasks;

        public SprintsDto(Long sprintId, String sprintName, String sprintGoal, LocalDate sprintStartDate,
                         LocalDate sprintEndDate, String sprintStatus, List<TasksDto> tasks) {
            this.sprintId = sprintId;
            this.sprintName = sprintName;
            this.sprintGoal = sprintGoal;
            this.sprintStartDate = sprintStartDate;
            this.sprintEndDate = sprintEndDate;
            this.sprintStatus = sprintStatus;
            this.tasks = tasks;
        }

        // Getters & Setters
        // ...
    }

    @Data
    public static class TasksDto {
        private String title;
        private String description;
        private String key;
        private String priority;
        private String status;
        private Integer storyPoints;
        private Integer estimate;
        private LocalDate dueDate;

        private AssigneeDTO assignee;

        public TasksDto(String title, String description, String key, String priority, String status,
                       Integer storyPoints, Integer estimate, LocalDate dueDate, AssigneeDTO assignee) {
            this.title = title;
            this.description = description;
            this.key = key;
            this.priority = priority;
            this.status = status;
            this.storyPoints = storyPoints;
            this.estimate = estimate;
            this.dueDate = dueDate;
            this.assignee = assignee;
        }

        // Getters & Setters
        // ...
    }

    @Data
    public static class AssigneeDTO {
        private String firstName;
        private String lastName;
        private String email;
        private String role;

        public AssigneeDTO( String firstName, String lastName, String email, String role) {
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.role = role;
        }

        // Getters & Setters
        // ...
    }

    // Constructor
    public ProjectSprintTaskDTO(Long projectId, String projectName, String projectKey, String projectDescription,
                                List<SprintsDto> sprints, List<TasksDto> backlogTasks) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.projectKey = projectKey;
        this.projectDescription = projectDescription;
        this.sprints = sprints;
        this.backlogTasks = backlogTasks;
    }

    // Getters & Setters
    // ...
}

