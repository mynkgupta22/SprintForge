package com.misogi.SprintForge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskCountDTO {
	
	private int totalTasks;
	private int completedTasks;
	private int inProgressTasks;
	private int dueIssue;
	private int todoTasks;
	private int inReviewTasks;

}
