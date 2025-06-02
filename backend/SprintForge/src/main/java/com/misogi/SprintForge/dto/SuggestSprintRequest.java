package com.misogi.SprintForge.dto;

import lombok.Data;

@Data
public class SuggestSprintRequest {
    private Long projectId;
    private Long sprintId; // Optional, can be null
} 