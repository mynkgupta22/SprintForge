package com.misogi.SprintForge.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.misogi.SprintForge.model.Project;
import com.misogi.SprintForge.model.Sprint;
import com.misogi.SprintForge.model.Sprint.SprintStatus;


@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
    List<Sprint> findByProjectIdOrderByStartDateDesc(Long projectId);
    
    List<Sprint> findByProjectIdAndStatusOrderByStartDateDesc(Long projectId, Sprint.SprintStatus status);

	Sprint findByProjectAndStatus(Project project, SprintStatus active);

	List<Sprint> findAllByProject(Project project);
} 