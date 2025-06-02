package com.misogi.SprintForge.service;

import com.misogi.SprintForge.dto.ActivityDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ActivityService {
    ActivityDTO createActivity(ActivityDTO activityDTO);
    
    ActivityDTO getActivity(Long id);
    
    List<ActivityDTO> getActivitiesByTaskId(Long taskId);
    
    List<ActivityDTO> getActivitiesByActor(Long actor);
    
    List<ActivityDTO> getAllActivities(Pageable pageable);
    
    List<ActivityDTO> getActivitiesByProjectId(Long projectId, Pageable pageable);
    
    void deleteActivity(Long id);
} 