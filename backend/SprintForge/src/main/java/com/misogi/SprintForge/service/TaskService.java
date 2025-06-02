package com.misogi.SprintForge.service;

import java.util.List;

import com.misogi.SprintForge.dto.TaskCountDTO;
import com.misogi.SprintForge.dto.TaskDTO;
import com.misogi.SprintForge.model.Task.TaskStatus;


public interface TaskService {
    TaskDTO createTask(TaskDTO taskDTO);
    TaskDTO updateTask(String key, TaskDTO taskDTO);
    TaskDTO getTaskByKey(String key);
    List<TaskDTO> getBacklogTasks(Long projectId);
    List<TaskDTO> getSprintTasks(Long sprintId);
    List<TaskDTO> getTasksByAssignee(Long assignee);
    List<TaskDTO> getTasksByProjectAndStatus(Long projectId, TaskStatus status);
    void deleteTask(String key);
    TaskDTO updateTaskStatus(Long id, TaskStatus status,Long sprintId);
    TaskDTO moveTaskToSprint(String key, Long sprintId);
    TaskDTO moveTaskToBacklog(String key);
    Integer getSprintCapacity(Long sprintId);
	TaskCountDTO getTotalTasks(Long projectId);
} 