package com.misogi.SprintForge.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.misogi.SprintForge.dto.TaskCountDTO;
import com.misogi.SprintForge.dto.TaskDTO;
import com.misogi.SprintForge.exception.ResourceNotFoundException;
import com.misogi.SprintForge.model.Activity;
import com.misogi.SprintForge.model.Project;
import com.misogi.SprintForge.model.Sprint;
import com.misogi.SprintForge.model.Task;
import com.misogi.SprintForge.model.Task.TaskStatus;
import com.misogi.SprintForge.model.User;
import com.misogi.SprintForge.model.Activity.ActivityType;
import com.misogi.SprintForge.repository.ActivityRepository;
import com.misogi.SprintForge.repository.ProjectRepository;
import com.misogi.SprintForge.repository.SprintRepository;
import com.misogi.SprintForge.repository.TaskRepository;
import com.misogi.SprintForge.repository.UserRepository;
import com.misogi.SprintForge.service.TaskService;
import com.misogi.SprintForge.service.contextService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final UserRepository userRepository;
    private final contextService contextService;
    private final ActivityRepository activityRepository;

    @Override
    public TaskDTO createTask(TaskDTO taskDTO) {
        Project project = projectRepository.findById(taskDTO.getProjectId())
            .orElseThrow(() -> new ResourceNotFoundException("Project", "id", taskDTO.getProjectId()));
        
        Task task = mapToEntity(taskDTO);
        task.setProject(project);
        
        if (taskDTO.getSprintId() != null) {
            Sprint sprint = sprintRepository.findById(taskDTO.getSprintId())
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", taskDTO.getSprintId()));
            task.setSprint(sprint);
        }
        
        // Generate task key (e.g., PRJ-123)
        String key = generateTaskKey(project);
        task.setKey(key);
        
        Task savedTask = taskRepository.save(task);
        return mapToDTO(savedTask);
    }

    @Override
    public TaskDTO updateTask(String key, TaskDTO taskDTO) {
        Task task = taskRepository.findByKey(key)
            .orElseThrow(() -> new ResourceNotFoundException("Task", "key", key));
        Optional<User> user = userRepository.findById(taskDTO.getAssignee());
        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setAssignee(user.get());
        task.setTags(taskDTO.getTags());
        task.setPriority(taskDTO.getPriority());
        task.setStatus(taskDTO.getStatus());
        task.setDueDate(taskDTO.getDueDate());
        task.setStoryPoints(taskDTO.getStoryPoints());
        task.setEstimate(taskDTO.getEstimate());
        
        Task updatedTask = taskRepository.save(task);
        return mapToDTO(updatedTask);
    }

    @Override
    public TaskDTO getTaskByKey(String key) {
        Task task = taskRepository.findByKey(key)
            .orElseThrow(() -> new ResourceNotFoundException("Task", "key", key));
        return mapToDTO(task);
    }

    @Override
    public List<TaskDTO> getBacklogTasks(Long projectId) {
        return taskRepository.findByProjectIdAndSprintIsNull(projectId).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<TaskDTO> getSprintTasks(Long sprintId) {
        return taskRepository.findBySprintId(sprintId).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<TaskDTO> getTasksByAssignee(Long assignee) {
        return taskRepository.findByAssigneeId(assignee).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<TaskDTO> getTasksByProjectAndStatus(Long projectId, TaskStatus status) {
        return taskRepository.findByProjectIdAndStatus(projectId, status).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public void deleteTask(String key) {
        Task task = taskRepository.findByKey(key)
            .orElseThrow(() -> new ResourceNotFoundException("Task", "key", key));
        taskRepository.delete(task);
    }

    @Override
    public TaskDTO updateTaskStatus(Long id, TaskStatus status,Long sprintId) {
    	User user = contextService.getCurrentUser();
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task", "key", id));
        if(sprintId != null ) {
        	Optional<Sprint> sprint = sprintRepository.findById(sprintId);
        	task.setSprint(sprint.get());
        }
        if(status.equals(TaskStatus.BACKLOG)) {
        	task.setSprint(null);

        }
        TaskStatus oldStatus = task.getStatus();
        task.setStatus(status);
        Task updatedTask = taskRepository.save(task);
    	Activity activity = new Activity();
		activity.setTask(updatedTask);
		activity.setType(ActivityType.STATUS_CHANGED);
		activity.setActor(user);
		activity.setDescription("Task moved from "+oldStatus.toString()+" to "+status.toString()+".");
		activity.setOldValue(oldStatus.toString());
		activity.setNewValue(status.toString());
		Activity savedActivity = activityRepository.save(activity);
        return mapToDTO(updatedTask);
    }

    @Override
    public TaskDTO moveTaskToSprint(String key, Long sprintId) {
        Task task = taskRepository.findByKey(key)
            .orElseThrow(() -> new ResourceNotFoundException("Task", "key", key));
        Sprint sprint = sprintRepository.findById(sprintId)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", sprintId));
        
        task.setSprint(sprint);
        return mapToDTO(taskRepository.save(task));
    }

    @Override
    public TaskDTO moveTaskToBacklog(String key) {
        Task task = taskRepository.findByKey(key)
            .orElseThrow(() -> new ResourceNotFoundException("Task", "key", key));
        task.setSprint(null);
        return mapToDTO(taskRepository.save(task));
    }

    @Override
    public Integer getSprintCapacity(Long sprintId) {
        return taskRepository.getTotalStoryPointsInSprint(sprintId);
    }

    private String generateTaskKey(Project project) {
        long count = taskRepository.count() + 1;
        return project.getKey() + "-" + count;
    }

    private Task mapToEntity(TaskDTO dto) {
        Task task = new Task();
    	if(dto.getAssignee() != null) {

    	Optional<User> user = userRepository.findById(dto.getAssignee());
    		 task.setAssignee(user.get());
    	}
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setKey(dto.getKey());
        task.setTags(dto.getTags());
        task.setPriority(dto.getPriority() != null ? dto.getPriority() : Task.TaskPriority.MEDIUM);
        task.setStatus(dto.getStatus() != null ? dto.getStatus() : TaskStatus.BACKLOG);
        task.setDueDate(dto.getDueDate());
        task.setStoryPoints(dto.getStoryPoints() != null ? dto.getStoryPoints() : 0);
        task.setEstimate(dto.getEstimate() != null ? dto.getEstimate() : 0);
        return task;
    }

    private TaskDTO mapToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setKey(task.getKey());
        dto.setProjectId(task.getProject().getId());
        dto.setSprintId(task.getSprint() != null ? task.getSprint().getId() : null);
        dto.setAssignee(task.getAssignee() != null ? task.getAssignee().getId() : null);
        dto.setTags(task.getTags());
        dto.setPriority(task.getPriority());
        dto.setStatus(task.getStatus());
        dto.setDueDate(task.getDueDate());
        dto.setStoryPoints(task.getStoryPoints());
        dto.setEstimate(task.getEstimate());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        dto.setCreatedBy(task.getCreatedBy());
        dto.setUpdatedBy(task.getUpdatedBy());
        return dto;
    }
    
    @Override
    public TaskCountDTO getTotalTasks(Long projectId) {
    	TaskCountDTO taskCountDto = new TaskCountDTO();
    	 int totalTasks=0;
    	 int completedTasks =0;
    	 int inProgressTasks =0;
    	 int dueIssue =0;
    	 int todoTasks =0;
    	 int inReviewTasks =0;
        List<Task> totalTaskList = taskRepository.findAllByProjectId(projectId);
        for(Task task:totalTaskList) {
        		totalTasks++;
        	
        	if(task.getStatus().equals(TaskStatus.DONE)) {
        		completedTasks++;
        	}else if(task.getStatus().equals(TaskStatus.IN_PROGRESS)) {
        		inProgressTasks++;
        	}else if(task.getStatus().equals(TaskStatus.TODO)) {
        		todoTasks++;
        	}
        	else if(task.getStatus().equals(TaskStatus.IN_REVIEW)) {
        		inReviewTasks++;
        	}
        	if(!task.getStatus().equals(TaskStatus.DONE) && task.getDueDate() != null && task.getDueDate().isAfter(LocalDateTime.now())) {
        		dueIssue++;
        	}
        }
        taskCountDto.setCompletedTasks(completedTasks);
        taskCountDto.setDueIssue(dueIssue);
        taskCountDto.setInProgressTasks(inProgressTasks);
        taskCountDto.setInReviewTasks(inReviewTasks);
        taskCountDto.setTodoTasks(todoTasks);
        taskCountDto.setTotalTasks(totalTasks);
        return taskCountDto;
    }
} 
