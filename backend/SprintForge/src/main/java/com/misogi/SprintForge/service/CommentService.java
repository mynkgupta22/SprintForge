package com.misogi.SprintForge.service;

import java.util.List;

import com.misogi.SprintForge.dto.CommentDTO;


public interface CommentService {
    CommentDTO createComment(CommentDTO commentDTO);
    CommentDTO updateComment(Long id, CommentDTO commentDTO);
    void deleteComment(Long id);
    List<CommentDTO> getCommentsByTask(Long taskId);
}