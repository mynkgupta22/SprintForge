package com.misogi.SprintForge.service.impl;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.misogi.SprintForge.dto.MemberDTO;
import com.misogi.SprintForge.dto.ProjectDTO;
import com.misogi.SprintForge.dto.ProjectMemberDTO;
import com.misogi.SprintForge.dto.ProjectSprintTaskDTO;
import com.misogi.SprintForge.dto.ProjectSprintTaskDTO.AssigneeDTO;
import com.misogi.SprintForge.dto.ProjectSprintTaskDTO.SprintsDto;
import com.misogi.SprintForge.dto.ProjectSprintTaskDTO.TasksDto;
import com.misogi.SprintForge.dto.SprintDTO;
import com.misogi.SprintForge.dto.TaskDTO;
import com.misogi.SprintForge.enums.Role;
import com.misogi.SprintForge.exception.ResourceNotFoundException;
import com.misogi.SprintForge.model.Project;
import com.misogi.SprintForge.model.Sprint;
import com.misogi.SprintForge.model.Sprint.SprintStatus;
import com.misogi.SprintForge.model.Task;
import com.misogi.SprintForge.model.Task.TaskStatus;
import com.misogi.SprintForge.model.User;
import com.misogi.SprintForge.repository.ProjectRepository;
import com.misogi.SprintForge.repository.SprintRepository;
import com.misogi.SprintForge.repository.TaskRepository;
import com.misogi.SprintForge.repository.UserRepository;
import com.misogi.SprintForge.service.ProjectService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectServiceImpl implements ProjectService {

	private final ProjectRepository projectRepository;
	private final UserRepository userRepository;
	private final SprintRepository sprintRepository;
	private final TaskRepository taskRepository;

	@Override
	public ProjectDTO createProject(ProjectDTO projectDTO) {
		Project project = mapToEntity(projectDTO);
		Project savedProject = projectRepository.save(project);
		return mapToDTO(savedProject);
	}

	@Override
	public ProjectDTO updateProject(Long key, ProjectDTO projectDTO) {
		Project project = projectRepository.findById(key)
				.orElseThrow(() -> new ResourceNotFoundException("Project", "key", key));

		project.setName(projectDTO.getName());
		project.setDescription(projectDTO.getDescription());
		project.setStatus(projectDTO.getStatus());
		if (projectDTO.getMembers() != null) {
			List<User> users = userRepository.findAllByIdIn(projectDTO.getMembers());
			project.setMembers(null);
		}

		Project updatedProject = projectRepository.save(project);
		return mapToDTO(updatedProject);
	}

	@Override
	public ProjectDTO getProjectByKey(Long key) {
		Project project = projectRepository.findById(key)
				.orElseThrow(() -> new ResourceNotFoundException("Project", "key", key));
		return mapToDTO(project);
	}

	@Override
	public List<ProjectDTO> getProjectsByMember(Long userId) {
		return projectRepository.findProjectsByMemberId(userId).stream().map(this::mapToDTO)
				.collect(Collectors.toList());
	}

	@Override
	public Page<ProjectDTO> getAllProjects(Pageable pageable) {
		return projectRepository.findAll(pageable).map(this::mapToDTO);
	}

	@Override
	public void deleteProject(String key) {
		Project project = projectRepository.findByKey(key)
				.orElseThrow(() -> new ResourceNotFoundException("Project", "key", key));
		projectRepository.delete(project);
	}

	@Override
	public void addMemberToProject(String key, Long userId) {
		Project project = projectRepository.findByKey(key)
				.orElseThrow(() -> new ResourceNotFoundException("Project", "key", key));
		Optional<User> user = userRepository.findById(userId);
		project.getMembers().add(user.get());
		projectRepository.save(project);
	}

	@Override
	public void removeMemberFromProject(String key, Long userId) {
		Project project = projectRepository.findByKey(key)
				.orElseThrow(() -> new ResourceNotFoundException("Project", "key", key));
		project.getMembers().remove(userId);
		projectRepository.save(project);
	}

	@Override
    public ProjectMemberDTO getProjectsMember(Long projectId){
    	ProjectMemberDTO projectMemberDTO = new ProjectMemberDTO();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "key", projectId));
        int totalMember = 0;
        projectMemberDTO.setProjectId(project.getId());
        projectMemberDTO.setProjectName(project.getName());
        List<MemberDTO> memberList = new ArrayList<>();
        if(!project.getMembers().isEmpty()) {
        	for(User user:project.getMembers()) {
        		if(user.getRoles().equals(Role.DEVELOPER)) {
        		MemberDTO memberDto = new MemberDTO();
        		memberDto.setEmail(user.getEmail());
        		memberDto.setFirstName(user.getFirstName());
        		memberDto.setLastName(user.getLastName());
        		memberDto.setId(user.getId());
        		memberDto.setUserName(user.getUsername());
        		totalMember++;
        		memberList.add(memberDto);
        		}
        	}
        }
        projectMemberDTO.setTotalMember(totalMember);
        projectMemberDTO.setMemberDtos(memberList);
        return projectMemberDTO;
    }

	private Project mapToEntity(ProjectDTO dto) {
		List<User> users = userRepository.findAllByIdIn(dto.getMembers());
		Set<User> userSet = new HashSet<>(users);
		Project project = new Project();
		project.setName(dto.getName());
		project.setDescription(dto.getDescription());
		project.setKey(dto.getKey());
		project.setMembers(userSet);
		project.setStatus(dto.getStatus() != null ? dto.getStatus() : Project.ProjectStatus.ACTIVE);
		return project;
	}

	private ProjectDTO mapToDTO(Project project) {
		ProjectDTO dto = new ProjectDTO();
		Set<Task> backLoagTask = project.getBacklogTasks();
		Set<TaskDTO> tds = new HashSet<>();
		for (Task task : backLoagTask) {
			if(task.getStatus().equals(TaskStatus.BACKLOG)) {
			TaskDTO td = new TaskDTO();
			td.setTitle(task.getTitle());
			td.setDescription(td.getDescription());
			td.setKey(task.getKey());
			tds.add(td);
			}
		}
		SprintDTO sprintDTO = new SprintDTO();
		Sprint sprint = sprintRepository.findByProjectAndStatus(project, SprintStatus.ACTIVE);
		List<Task> taskList = taskRepository.findBySprintAndStatusNot(sprint,TaskStatus.BACKLOG);
		sprintDTO.setId(sprint.getId());
		sprintDTO.setName(sprint.getName());
		sprintDTO.setGoal(sprint.getGoal());
		sprintDTO.setStartDate(sprint.getStartDate());
		sprintDTO.setEndDate(sprint.getEndDate());
		sprintDTO.setStatus(sprint.getStatus());
		sprintDTO.setCapacity(sprint.getCapacity());
    	Set<TaskDTO> taskDtoList = new HashSet<>();
	    for(Task task: taskList) {
				TaskDTO taskDTO = new TaskDTO();
				taskDTO.setId(task.getId());
				taskDTO.setTitle(task.getTitle());
				taskDTO.setDescription(task.getDescription());
				taskDTO.setKey(task.getKey());
				taskDTO.setAssignee(task.getAssignee() != null ? task.getAssignee().getId() : null);
				taskDTO.setTags(task.getTags());
				taskDTO.setPriority(task.getPriority());
				taskDTO.setStatus(task.getStatus());
				taskDTO.setDueDate(task.getDueDate());
				taskDtoList.add(taskDTO);
			
	    }
	    sprintDTO.setTasks(taskDtoList);
		dto.setActiveSprint(sprintDTO);
		dto.setBacklogTasks(tds);
		dto.setId(project.getId());
		dto.setName(project.getName());
		dto.setDescription(project.getDescription());
		dto.setKey(project.getKey());
		dto.setMembers(project.getMembers().stream().map(User::getId) // extract the ID from each User
				.collect(Collectors.toSet()));
		dto.setStatus(project.getStatus());
		dto.setCreatedAt(project.getCreatedAt());
		dto.setUpdatedAt(project.getUpdatedAt());
		dto.setCreatedBy(project.getCreatedBy());
		dto.setUpdatedBy(project.getUpdatedBy());
		return dto;
	}
	
	@Override
	public ProjectSprintTaskDTO getProjectEmbedded(Long projectId) {
		Project project = projectRepository.findById(projectId).orElseThrow();
		List<Sprint> sprints = sprintRepository.findAllByProject(project);
		List<Task> allTasks = taskRepository.findAllByProject(project);

		// Split into sprint-tasks and backlog tasks
		Map<Long, List<Task>> sprintTaskMap = allTasks.stream()
		    .filter(task -> task.getSprint() != null)
		    .collect(Collectors.groupingBy(task -> task.getSprint().getId()));

		List<Task> backlogTasks = allTasks.stream()
		    .filter(task -> task.getSprint() == null)
		    .collect(Collectors.toList());

		// Map sprint DTOs
		List<SprintsDto> sprintDTOs = sprints.stream().map(sprint -> {
		    List<Task> tasksForSprint = sprintTaskMap.getOrDefault(sprint.getId(), List.of());
		    List<TasksDto> taskDTOs = tasksForSprint.stream().map(this::mapTaskToDTO).toList();

		    return new SprintsDto(
		        sprint.getId(),
		        sprint.getName(),
		        sprint.getGoal(),
		        sprint.getStartDate(),
		        sprint.getEndDate(),
		        sprint.getStatus().name(),
		        taskDTOs
		    );
		}).toList();

		// Map backlog task DTOs
		List<TasksDto> backlogTaskDTOs = backlogTasks.stream()
		    .map(this::mapTaskToDTO)
		    .toList();

		// Final Project DTO
		  ProjectSprintTaskDTO result = new ProjectSprintTaskDTO(
		    project.getId(),
		    project.getName(),
		    project.getKey(),
		    project.getDescription(),
		    sprintDTOs,
		    backlogTaskDTOs
		);
		  return result;

	}
	
	private TasksDto mapTaskToDTO(Task task) {
	    User assignee = task.getAssignee(); // assuming task.getAssignee() returns a User
	    AssigneeDTO assigneeDTO = null;

	    if (assignee != null) {
	        assigneeDTO = new AssigneeDTO(
	            assignee.getId(),
	            assignee.getFirstName(),
	            assignee.getLastName(),
	            assignee.getEmail(),
	            assignee.getRoles().name()
	        );
	    }

	    return new TasksDto(
	        task.getTitle(),
	        task.getDescription(),
	        task.getKey(),
	        task.getPriority().toString(),
	        task.getStatus().toString(),
	        task.getStoryPoints(),
	        task.getEstimate(),
	        task.getDueDate(),
	        assigneeDTO
	    );
	}
	

}
