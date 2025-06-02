package com.misogi.SprintForge.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.misogi.SprintForge.model.Activity;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByTaskIdOrderByCreatedAtDesc(Long taskId);
    
    List<Activity> findByActorIdOrderByCreatedAtDesc(Long actor);
    
    Page<Activity> findByTaskProjectIdOrderByCreatedAtDesc(Long projectId, Pageable pageable);
} 
