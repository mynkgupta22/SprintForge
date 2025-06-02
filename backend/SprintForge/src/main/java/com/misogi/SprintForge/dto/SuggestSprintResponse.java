package com.misogi.SprintForge.dto;

import lombok.Data;
import java.util.List;

@Data
public class SuggestSprintResponse {
    private List<String> taskKeys;
} 