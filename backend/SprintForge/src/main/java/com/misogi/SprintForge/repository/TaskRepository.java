package com.misogi.SprintForge.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.misogi.SprintForge.model.Project;
import com.misogi.SprintForge.model.Sprint;
import com.misogi.SprintForge.model.Task;
import com.misogi.SprintForge.model.Task.TaskStatus;


@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    Optional<Task> findByKey(String key);
    
    List<Task> findByProjectIdAndSprintIsNull(Long projectId);
    
    List<Task> findBySprintId(Long sprintId);
    
    List<Task> findByAssigneeId(Long assignee);
    
    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.status = :status")
    List<Task> findByProjectIdAndStatus(Long projectId, Task.TaskStatus status);
    
    boolean existsByKey(String key);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.sprint.id = :sprintId")
    long countTasksInSprint(Long sprintId);
    
    @Query("SELECT SUM(t.storyPoints) FROM Task t WHERE t.sprint.id = :sprintId")
    Integer getTotalStoryPointsInSprint(Long sprintId);

	List<Task> findAllByProjectId(Long projectId);

	List<Task> findBySprintAndStatusNot(Sprint sprint, TaskStatus backlog);

	List<Task> findAllByProject(Project project);
} 