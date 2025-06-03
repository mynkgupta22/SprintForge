package com.misogi.SprintForge.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.misogi.SprintForge.dto.SprintDTO;
import com.misogi.SprintForge.exception.BadRequestException;
import com.misogi.SprintForge.exception.ResourceNotFoundException;
import com.misogi.SprintForge.model.Project;
import com.misogi.SprintForge.model.Sprint;
import com.misogi.SprintForge.model.Sprint.SprintStatus;
import com.misogi.SprintForge.repository.ProjectRepository;
import com.misogi.SprintForge.repository.SprintRepository;
import com.misogi.SprintForge.service.SprintService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class SprintServiceImpl implements SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;

    @Override
    public SprintDTO createSprint(SprintDTO sprintDTO) {
        Project project = projectRepository.findById(sprintDTO.getProjectId())
            .orElseThrow(() -> new ResourceNotFoundException("Project", "id", sprintDTO.getProjectId()));
        if(sprintDTO.getStatus().equals(SprintStatus.ACTIVE) && !project.getSprints().isEmpty()) {
        	for(Sprint s: project.getSprints()) {
        		if(s.getStatus().equals(SprintStatus.ACTIVE))
        			throw new BadRequestException("Only One Sprint Can Active At A Time.");
        	}
        }
        Sprint sprint = mapToEntity(sprintDTO);
        sprint.setProject(project);
        Sprint savedSprint = sprintRepository.save(sprint);
        return mapToDTO(savedSprint);
    }

    @Override
    public SprintDTO updateSprint(Long id, SprintDTO sprintDTO) {
        Sprint sprint = sprintRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", id));
        Project project = projectRepository.findById(sprintDTO.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", sprintDTO.getProjectId()));
            if(sprintDTO.getStatus().equals(SprintStatus.ACTIVE) && !project.getSprints().isEmpty()) {
            	for(Sprint s: project.getSprints()) {
            		if(s.getStatus().equals(SprintStatus.ACTIVE) && s.getId() != id)
            			throw new BadRequestException("Only One Sprint Can Active At A Time.");
            	}
            }
        sprint.setName(sprintDTO.getName());
        sprint.setGoal(sprintDTO.getGoal());
        sprint.setStartDate(sprintDTO.getStartDate());
        sprint.setEndDate(sprintDTO.getEndDate());
        sprint.setStatus(sprintDTO.getStatus());
        sprint.setCapacity(sprintDTO.getCapacity());
        
        Sprint updatedSprint = sprintRepository.save(sprint);
        return mapToDTO(updatedSprint);
    }

    @Override
    public SprintDTO getSprint(Long id) {
        Sprint sprint = sprintRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", id));
        return mapToDTO(sprint);
    }

    @Override
    public List<SprintDTO> getSprintsByProject(Long projectId) {
        return sprintRepository.findByProjectIdOrderByStartDateDesc(projectId).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<SprintDTO> getSprintsByProjectAndStatus(Long projectId, SprintStatus status) {
        return sprintRepository.findByProjectIdAndStatusOrderByStartDateDesc(projectId, status).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public void deleteSprint(Long id) {
        Sprint sprint = sprintRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", id));
        sprintRepository.delete(sprint);
    }

    @Override
    public SprintDTO startSprint(Long id) {
        Sprint sprint = sprintRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", id));
        sprint.setStatus(SprintStatus.ACTIVE);
        return mapToDTO(sprintRepository.save(sprint));
    }

    @Override
    public SprintDTO completeSprint(Long id) {
        Sprint sprint = sprintRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", id));
        sprint.setStatus(SprintStatus.COMPLETED);
        return mapToDTO(sprintRepository.save(sprint));
    }

    private Sprint mapToEntity(SprintDTO dto) {
        Sprint sprint = new Sprint();
        sprint.setName(dto.getName());
        sprint.setGoal(dto.getGoal());
        sprint.setStartDate(dto.getStartDate());
        sprint.setEndDate(dto.getEndDate());
        sprint.setStatus(dto.getStatus() != null ? dto.getStatus() : SprintStatus.PLANNED);
        sprint.setCapacity(dto.getCapacity() != null ? dto.getCapacity() : 0);
        return sprint;
    }

    private SprintDTO mapToDTO(Sprint sprint) {
        SprintDTO dto = new SprintDTO();
        dto.setId(sprint.getId());
        dto.setName(sprint.getName());
        dto.setGoal(sprint.getGoal());
        dto.setStartDate(sprint.getStartDate());
        dto.setEndDate(sprint.getEndDate());
        dto.setProjectId(sprint.getProject().getId());
        dto.setStatus(sprint.getStatus());
        dto.setCapacity(sprint.getCapacity());
        dto.setCreatedAt(sprint.getCreatedAt());
        dto.setUpdatedAt(sprint.getUpdatedAt());
        dto.setCreatedBy(sprint.getCreatedBy());
        dto.setUpdatedBy(sprint.getUpdatedBy());
        return dto;
    }
} 