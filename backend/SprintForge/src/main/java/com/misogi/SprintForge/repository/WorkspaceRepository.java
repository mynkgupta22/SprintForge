package com.misogi.SprintForge.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.misogi.SprintForge.model.Workspace;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
	@Query("SELECT w FROM Workspace w WHERE w.createdBy = :userId OR EXISTS (SELECT m FROM w.users m WHERE m.id = :userId)")
	List<Workspace> findWorkspacesByUserIdOrderByName(@Param("userId") Long userId);

    
    Optional<Workspace> findByName(String name);
    
    boolean existsByName(String name);
} 