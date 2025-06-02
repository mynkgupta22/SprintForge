package com.misogi.SprintForge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberDTO {
	
	private Long id;
	private String email;
	private String firstName;
	private String lastName;
	private String userName;

}
