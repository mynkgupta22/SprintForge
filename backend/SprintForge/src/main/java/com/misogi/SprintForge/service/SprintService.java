package com.misogi.SprintForge.service;

import java.util.List;

import com.misogi.SprintForge.dto.SprintDTO;
import com.misogi.SprintForge.model.Sprint.SprintStatus;



public interface SprintService {
    SprintDTO createSprint(SprintDTO sprintDTO);
    SprintDTO updateSprint(Long id, SprintDTO sprintDTO);
    SprintDTO getSprint(Long id);
    List<SprintDTO> getSprintsByProject(Long projectId);
    List<SprintDTO> getSprintsByProjectAndStatus(Long projectId, SprintStatus status);
    void deleteSprint(Long id);
    SprintDTO startSprint(Long id);
    SprintDTO completeSprint(Long id);
} 