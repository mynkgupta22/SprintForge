package com.misogi.SprintForge.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.misogi.SprintForge.dto.ActivityDTO;
import com.misogi.SprintForge.dto.CommentDTO;
import com.misogi.SprintForge.exception.ResourceNotFoundException;
import com.misogi.SprintForge.model.Activity;
import com.misogi.SprintForge.model.Activity.ActivityType;
import com.misogi.SprintForge.model.Comment;
import com.misogi.SprintForge.model.Task;
import com.misogi.SprintForge.model.User;
import com.misogi.SprintForge.repository.ActivityRepository;
import com.misogi.SprintForge.repository.CommentRepository;
import com.misogi.SprintForge.repository.TaskRepository;
import com.misogi.SprintForge.repository.UserRepository;
import com.misogi.SprintForge.service.CommentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService {

	private final CommentRepository commentRepository;
	private final TaskRepository taskRepository;
	private final UserRepository userRepository;
	private final ActivityRepository activityRepository;

	@Override
	public CommentDTO createComment(CommentDTO commentDTO) {
		Task task = taskRepository.findById(commentDTO.getTaskId())
				.orElseThrow(() -> new ResourceNotFoundException("Task", "id", commentDTO.getTaskId()));

		Comment comment = mapToEntity(commentDTO);
		comment.setTask(task);
		Comment savedComment = commentRepository.save(comment);
		Activity activity = new Activity();
		activity.setTask(task);
		activity.setDescription(comment.getContent());
		activity.setCommentId(comment.getId());
		activity.setType(ActivityType.COMMENT_ADDED);
		activity.setActor(comment.getAuthor());
		Activity savedActivity = activityRepository.save(activity);
		return mapToDTO(savedComment);

	

	}

	@Override
	public CommentDTO updateComment(Long id, CommentDTO commentDTO) {
		Comment comment = commentRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Comment", "id", id));

		comment.setContent(commentDTO.getContent());
		Comment updatedComment = commentRepository.save(comment);
		return mapToDTO(updatedComment);
	}

	@Override
	public void deleteComment(Long id) {
		Comment comment = commentRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Comment", "id", id));
		commentRepository.delete(comment);
	}

	@Override
	public List<CommentDTO> getCommentsByTask(Long taskId) {
		return commentRepository.findByTaskIdOrderByCreatedAtDesc(taskId).stream().map(this::mapToDTO)
				.collect(Collectors.toList());
	}

	private Comment mapToEntity(CommentDTO dto) {
		Optional<User> user = userRepository.findById(dto.getAuthor());
		Comment comment = new Comment();
		comment.setContent(dto.getContent());
		comment.setAuthor(user.get());
		return comment;
	}

	private CommentDTO mapToDTO(Comment comment) {
		CommentDTO dto = new CommentDTO();
		dto.setId(comment.getId());
		dto.setContent(comment.getContent());
		dto.setTaskId(comment.getTask().getId());
		dto.setAuthor(comment.getAuthor().getId());
		dto.setCreatedAt(comment.getCreatedAt());
		dto.setUpdatedAt(comment.getUpdatedAt());
		dto.setCreatedBy(comment.getCreatedBy());
		dto.setUpdatedBy(comment.getUpdatedBy());
		return dto;
	}
}