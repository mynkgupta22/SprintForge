package com.misogi.SprintForge.controller;

import com.misogi.SprintForge.dto.ActivityDTO;
import com.misogi.SprintForge.service.ActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PM', 'DEVELOPER')")
    public ResponseEntity<ActivityDTO> createActivity(@Valid @RequestBody ActivityDTO activityDTO) {
        return new ResponseEntity<>(activityService.createActivity(activityDTO), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivityDTO> getActivity(@PathVariable Long id) {
        return ResponseEntity.ok(activityService.getActivity(id));
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<ActivityDTO>> getActivitiesByTaskId(@PathVariable Long taskId) {
        return ResponseEntity.ok(activityService.getActivitiesByTaskId(taskId));
    }

    @GetMapping("/actor/{actor}")
    public ResponseEntity<List<ActivityDTO>> getActivitiesByActor(@PathVariable Long actor) {
        return ResponseEntity.ok(activityService.getActivitiesByActor(actor));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ActivityDTO>> getAllActivities(Pageable pageable) {
        return ResponseEntity.ok(activityService.getAllActivities(pageable));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ActivityDTO>> getActivitiesByProjectId(
            @PathVariable Long projectId,
            Pageable pageable) {
        return ResponseEntity.ok(activityService.getActivitiesByProjectId(projectId, pageable));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id) {
        activityService.deleteActivity(id);
        return ResponseEntity.noContent().build();
    }
} 