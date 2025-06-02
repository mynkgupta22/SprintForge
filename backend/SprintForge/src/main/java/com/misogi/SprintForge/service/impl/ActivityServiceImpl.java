package com.misogi.SprintForge.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.misogi.SprintForge.dto.ActivityDTO;
import com.misogi.SprintForge.exception.ResourceNotFoundException;
import com.misogi.SprintForge.model.Activity;
import com.misogi.SprintForge.model.Task;
import com.misogi.SprintForge.model.User;
import com.misogi.SprintForge.repository.ActivityRepository;
import com.misogi.SprintForge.repository.TaskRepository;
import com.misogi.SprintForge.repository.UserRepository;
import com.misogi.SprintForge.service.ActivityService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository activityRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Override
    public ActivityDTO createActivity(ActivityDTO activityDTO) {
        Activity activity = mapToEntity(activityDTO);
        
        Task task = taskRepository.findById(activityDTO.getTaskId())
            .orElseThrow(() -> new ResourceNotFoundException("Task", "id", activityDTO.getTaskId()));
        activity.setTask(task);
        
        Activity savedActivity = activityRepository.save(activity);
        return mapToDTO(savedActivity);
    }

    @Override
    public ActivityDTO getActivity(Long id) {
        Activity activity = activityRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Activity", "id", id));
        return mapToDTO(activity);
    }

    @Override
    public List<ActivityDTO> getActivitiesByTaskId(Long taskId) {
        return activityRepository.findByTaskIdOrderByCreatedAtDesc(taskId).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<ActivityDTO> getActivitiesByActor(Long actor) {
        return activityRepository.findByActorIdOrderByCreatedAtDesc(actor).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<ActivityDTO> getAllActivities(Pageable pageable) {
        return activityRepository.findAll(pageable)
            .map(this::mapToDTO)
            .getContent(); // Extract the List from Page

    }

    @Override
    public List<ActivityDTO> getActivitiesByProjectId(Long projectId, Pageable pageable) {
        return activityRepository.findByTaskProjectIdOrderByCreatedAtDesc(projectId, pageable)
                .map(this::mapToDTO)
                .getContent(); // Extract the List from Page
    }


    @Override
    public void deleteActivity(Long id) {
        Activity activity = activityRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Activity", "id", id));
        activityRepository.delete(activity);
    }

    private Activity mapToEntity(ActivityDTO dto) {
    	Optional<User> user= userRepository.findById(dto.getActor());
        Activity activity = new Activity();
        activity.setType(dto.getType());
        activity.setDescription(dto.getDescription());
        activity.setActor(user.get());
        activity.setOldValue(dto.getOldValue());
        activity.setNewValue(dto.getNewValue());
        return activity;
    }

    private ActivityDTO mapToDTO(Activity activity) {
        ActivityDTO dto = new ActivityDTO();
        dto.setId(activity.getId());
        dto.setType(activity.getType());
        dto.setDescription(activity.getDescription());
        dto.setActor(activity.getActor().getId());
        dto.setTaskId(activity.getTask().getId());
        dto.setTaskKey(activity.getTask().getKey());
        dto.setTaskTitle(activity.getTask().getTitle());
        dto.setOldValue(activity.getOldValue());
        dto.setNewValue(activity.getNewValue());
        dto.setCreatedAt(activity.getCreatedAt());
        dto.setCreatedBy(activity.getCreatedBy());
        return dto;
    }
} 