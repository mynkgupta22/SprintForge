package com.misogi.SprintForge.service;

import com.misogi.SprintForge.dto.InviteDTO;
import com.misogi.SprintForge.enums.Role;

import java.util.Optional;

public interface InviteService {
    InviteDTO createInvite(InviteDTO inviteDTO);
    Optional<InviteDTO> getPendingInviteByEmailAndRole(String email, Role role);
    void acceptInvite(Long inviteId);
} 