package com.misogi.SprintForge.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.misogi.SprintForge.dto.TaskCountDTO;
import com.misogi.SprintForge.dto.TaskDTO;
import com.misogi.SprintForge.model.Task.TaskStatus;
import com.misogi.SprintForge.service.TaskService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@Valid @RequestBody TaskDTO taskDTO) {
        return new ResponseEntity<>(taskService.createTask(taskDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskDTO taskDTO) {
        return ResponseEntity.ok(taskService.updateTask(id, taskDTO));
    }

    @GetMapping("/{key}")
    public ResponseEntity<TaskDTO> getTask(@PathVariable String key) {
        return ResponseEntity.ok(taskService.getTaskByKey(key));
    }

    @GetMapping("/backlog/{projectId}")
    public ResponseEntity<List<TaskDTO>> getBacklogTasks(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getBacklogTasks(projectId));
    }

    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<List<TaskDTO>> getSprintTasks(@PathVariable Long sprintId) {
        return ResponseEntity.ok(taskService.getSprintTasks(sprintId));
    }

    @GetMapping("/assignee/{assignee}")
    public ResponseEntity<List<TaskDTO>> getTasksByAssignee(@PathVariable Long assignee) {
        return ResponseEntity.ok(taskService.getTasksByAssignee(assignee));
    }

    @GetMapping("/project/{projectId}/status/{status}")
    public ResponseEntity<List<TaskDTO>> getTasksByProjectAndStatus(
            @PathVariable Long projectId,
            @PathVariable TaskStatus status) {
        return ResponseEntity.ok(taskService.getTasksByProjectAndStatus(projectId, status));
    }

    @DeleteMapping("/{key}")
    public ResponseEntity<Void> deleteTask(@PathVariable String key) {
        taskService.deleteTask(key);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<TaskDTO> updateTaskStatus(
            @PathVariable Long id,
            @PathVariable TaskStatus status,
            @RequestParam Long sprintId) {
    	
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status,sprintId));
    }

    @PostMapping("/{id}/move-to-sprint/{sprintId}")
    public ResponseEntity<TaskDTO> moveTaskToSprint(
            @PathVariable Long id,
            @PathVariable Long sprintId) {
        return ResponseEntity.ok(taskService.moveTaskToSprint(id, sprintId));
    }

    @PostMapping("/{key}/move-to-backlog")
    public ResponseEntity<TaskDTO> moveTaskToBacklog(@PathVariable String key) {
        return ResponseEntity.ok(taskService.moveTaskToBacklog(key));
    }

    @GetMapping("/sprint/{sprintId}/capacity")
    public ResponseEntity<Integer> getSprintCapacity(@PathVariable Long sprintId) {
        return ResponseEntity.ok(taskService.getSprintCapacity(sprintId));
    }
    
    @GetMapping("/total-task/{projectId}")
    public ResponseEntity<TaskCountDTO> getTaskCount(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getTotalTasks(projectId));
    }
} 