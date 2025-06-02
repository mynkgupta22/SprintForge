package com.misogi.SprintForge.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMemberDTO {
	
	private Long projectId;
	private String projectName;
	private int totalMember;
	private List<MemberDTO> memberDtos;

}
