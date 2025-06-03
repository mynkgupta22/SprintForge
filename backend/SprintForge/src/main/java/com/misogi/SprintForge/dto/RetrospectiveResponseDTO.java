package com.misogi.SprintForge.dto;

import lombok.Data;

@Data
public class RetrospectiveResponseDTO {
	
	private String sprintName;
	private String whatWentWell;
	private String whatDidNotGoWell;
	private String suggestions;

}
