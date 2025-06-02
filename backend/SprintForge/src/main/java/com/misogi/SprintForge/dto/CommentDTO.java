package com.misogi.SprintForge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentDTO {
    private Long id;
    
    @NotBlank(message = "Comment content is required")
    private String content;
    
    private Long taskId;
    private Long author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
}

@Data
class CommentCreateRequest {
    @NotBlank(message = "Comment content is required")
    private String content;
    
    @NotNull(message = "Task ID is required")
    private Long taskId;
} 