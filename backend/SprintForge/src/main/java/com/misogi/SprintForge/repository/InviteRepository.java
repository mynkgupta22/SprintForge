package com.misogi.SprintForge.repository;

import com.misogi.SprintForge.model.Invite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InviteRepository extends JpaRepository<Invite, Long> {
    Optional<Invite> findByEmailAndRoleAndAcceptedFalse(String email, com.misogi.SprintForge.enums.Role role);
    boolean existsByEmailAndRoleAndAcceptedFalse(String email, com.misogi.SprintForge.enums.Role role);
} 