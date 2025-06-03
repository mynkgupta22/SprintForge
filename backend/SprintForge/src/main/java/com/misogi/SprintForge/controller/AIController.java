package com.misogi.SprintForge.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.misogi.SprintForge.dto.RetrospectiveRequest;
import com.misogi.SprintForge.dto.RetrospectiveResponseDTO;
import com.misogi.SprintForge.dto.RiskHeatMapResponseDTO;
import com.misogi.SprintForge.dto.RiskHeatmapRequest;
import com.misogi.SprintForge.dto.ScopeCreepDTO;
import com.misogi.SprintForge.dto.ScopeCreepRequest;
import com.misogi.SprintForge.dto.SuggestSprintRequest;
import com.misogi.SprintForge.dto.SuggestSprintResponse;
import com.misogi.SprintForge.model.ChunkEmbedding;
import com.misogi.SprintForge.repository.ChunkEmbeddingRepository;
import com.misogi.SprintForge.service.ProjectService;
import com.misogi.SprintForge.service.contextService;
import com.misogi.SprintForge.service.ai.AISprintService;
import com.misogi.SprintForge.service.ai.EmbeddingAddService;
import com.misogi.SprintForge.service.ai.EmbeddingService;
import com.misogi.SprintForge.service.ai.GeminiService;

@RestController
@RequestMapping("/api/ai")
public class AIController {

	@Autowired
	private AISprintService aiSprintService;

	@Autowired
	private GeminiService geminiService;

	@Autowired
	private EmbeddingAddService chunkStorageService;

	@Autowired
	private EmbeddingService embeddingService;

	@Autowired
	private ChunkEmbeddingRepository repository;

	@Autowired
	private contextService ContextService;

	@Autowired
	private ProjectService projectService;

	@PostMapping("/suggest-sprint")
	public SuggestSprintResponse suggestSprint(@RequestBody SuggestSprintRequest request) {

		return aiSprintService.suggestSprint(request);
	}

	@PostMapping("/scope-creep")
	public ResponseEntity<ScopeCreepDTO> detectScopeCreep(@RequestBody ScopeCreepRequest request) throws IOException {
		String source = request.getProjectId().toString();

		String prompt = String
				.format("""
						 You are an AI assistant helping identify sprint scope creep in an agile project. You will receive structured natural language descriptions of project sprints and tasks (previously converted from structured DTO data).

						Your job is to analyze the sprint information and detect scope creep — that is, situations where the scope of the sprint has grown silently or without proper planning. You should look for signs such as:
						- Number of tasks increasing after sprint start
						- New tasks being added frequently during the sprint
						- Sprint backlog increasing faster than tasks are completed
						- Frequent changes in task estimates, story points, or priorities mid-sprint

						Return a list of sprint names (with IDs if available) where scope creep is suspected, and briefly explain why you flagged each sprint.

						Use this json format for the response:
						{"Sprint Name": [Sprint Name]
						"Reason for Scope Creep Detection": [Explain what patterns indicate scope creep]}

						Now analyze the following sprint data:

						 	        """);
		// 1. Get vector for query using Python microservice
		List<Double> queryVector = embeddingService.getEmbedding(prompt);

		// Call the custom repository method
		List<ChunkEmbedding> topChunks = repository.findSimilarByVector(queryVector, source);

		// 3. Build context from those chunks
		StringBuilder context = new StringBuilder("Context:\n");
		for (int i = 0; i < topChunks.size(); i++) {
			context.append(i + 1).append(". ").append(topChunks.get(i).getChunkText()).append("\n\n");
		}

		context.append("User Question: ").append(prompt);

		// 4. Call Gemini
		String answer = geminiService.ask(context.toString());
		String cleanAnswer = answer.trim(); // Remove leading/trailing whitespace

		// Check if it starts and ends with backticks, and remove them
		if (cleanAnswer.startsWith("```json") && cleanAnswer.endsWith("```")) {
			cleanAnswer = cleanAnswer.substring(7, cleanAnswer.length() - 3).trim(); // Remove "```json" and "```"
		} else if (cleanAnswer.startsWith("```") && cleanAnswer.endsWith("```")) {
			cleanAnswer = cleanAnswer.substring(3, cleanAnswer.length() - 3).trim(); // Remove "```"
		}

		ObjectMapper objectMapper = new ObjectMapper();
		JsonNode jsonNode = objectMapper.readTree(cleanAnswer);

		// Now you can access elements:
		String sprintName = jsonNode.get("Sprint Name").asText();
		String reason = jsonNode.get("Reason for Scope Creep Detection").asText();
		ScopeCreepDTO res = new ScopeCreepDTO();
		res.setSprintName(sprintName);
		res.setReasonForScopeCreepDetection(reason);

		return ResponseEntity.ok(res);
//        return aiSprintService.detectScopeCreep(request);
	}

	@PostMapping("/risk-heatmap")
	public ResponseEntity<RiskHeatMapResponseDTO> generateRiskHeatmap(@RequestBody RiskHeatmapRequest request)
			throws IOException {
		String source = request.getProjectId().toString();

		String prompt = String
				.format("""
						 	  You are an AI assistant that analyzes Agile sprint data and generates a risk heatmap for project execution.

						You will receive natural-language structured descriptions of projects, sprints, and tasks — including assignees, priorities, statuses, story points, estimates, and due dates.

						Your job is to identify likely blockers or overloaded team members that could cause project delays or sprint failure. Look for patterns such as:
						- A team member assigned too many tasks or high total workload
						- High-priority tasks concentrated on a few people
						- Tasks without an assignee close to due date
						- Tasks in the same status for too long (possible bottlenecks)
						- Uneven task distribution across assignees

						Return the results as a list of risks or red flags, using this format:

						---
						**Risk Type**: [e.g. Overloaded Member, Unassigned Task, Bottleneck]
						**Details**: [Explanation with task titles, assignee names, estimates, priorities, and due dates]
						**Sprint**: [Sprint Name]
						---

						Now analyze the following sprint and task data:


						    	        """);
		// 1. Get vector for query using Python microservice
		List<Double> queryVector = embeddingService.getEmbedding(prompt);

		// Call the custom repository method
		List<ChunkEmbedding> topChunks = repository.findSimilarByVector(queryVector, source);

		// 3. Build context from those chunks
		StringBuilder context = new StringBuilder("Context:\n");
		for (int i = 0; i < topChunks.size(); i++) {
			context.append(i + 1).append(". ").append(topChunks.get(i).getChunkText()).append("\n\n");
		}

		context.append("User Question: ").append(prompt);

		// 4. Call Gemini
		String answer = geminiService.ask(context.toString());
		String cleanAnswer = answer.trim(); // Remove leading/trailing whitespace

		// Check if it starts and ends with backticks, and remove them
		if (cleanAnswer.startsWith("```json") && cleanAnswer.endsWith("```")) {
			cleanAnswer = cleanAnswer.substring(7, cleanAnswer.length() - 3).trim(); // Remove "```json" and "```"
		} else if (cleanAnswer.startsWith("```") && cleanAnswer.endsWith("```")) {
			cleanAnswer = cleanAnswer.substring(3, cleanAnswer.length() - 3).trim(); // Remove "```"
		}

		ObjectMapper objectMapper = new ObjectMapper();
		JsonNode jsonNode = objectMapper.readTree(cleanAnswer);

		// Now you can access elements:
		String riskType = jsonNode.get("Risk Type").asText();
		String details = jsonNode.get("Details").asText();
		String sprint = jsonNode.get("Sprint").asText();
		RiskHeatMapResponseDTO res = new RiskHeatMapResponseDTO();
		res.setSprint(sprint);
		res.setDetails(details);
		res.setRiskType(riskType);
		return ResponseEntity.ok(res);

//		return aiSprintService.generateRiskHeatmap(request);
	}

	@PostMapping("/retrospective")
	public ResponseEntity<List<RetrospectiveResponseDTO>> generateRetrospective(@RequestBody RetrospectiveRequest request) throws IOException {
		String source = request.getProjectId().toString();
		String sprintId = request.getSprintId().toString();

		String prompt = String.format("""
			You are an AI Scrum Master. Your task is to generate a concise and insightful sprint retrospective based on structured descriptions of completed sprints.

			The input includes sprint details, task lists, statuses, assignees, estimates, priorities, completion dates, delays, and optionally task logs or updates.

			You should ONLY generate the retrospective for the sprint matching the given sprintId.

			Your retrospective should highlight:
			- What went well (e.g., completed tasks, team collaboration)
			- What didn’t go well (e.g., delays, blockers, unassigned tasks)
			- Actionable suggestions (e.g., rebalance workload, refine estimates)

			Use the following format for the output:

			---
			**Sprint Name**: [Sprint Name]
			**Sprint ID**: [Sprint ID]
			**What went well**: [Positive highlights]
			**What did not go well**: [Issues, delays, missed estimates]
			**Suggestions**: [Actionable improvements for future sprints]
			---

			Now, generate the retrospective only for the sprint that matches the following sprintId: %s.

			Here is the sprint data:
		""", sprintId);

		// 1. Get vector for query using Python microservice
		List<Double> queryVector = embeddingService.getEmbedding(prompt);

		// 2. Call the custom repository method
		List<ChunkEmbedding> topChunks = repository.findSimilarByVector(queryVector, source);

		// 3. Build context from those chunks
		StringBuilder context = new StringBuilder("Context:\n");
		for (int i = 0; i < topChunks.size(); i++) {
			context.append(i + 1).append(". ").append(topChunks.get(i).getChunkText()).append("\n\n");
		}
		context.append("User Question: ").append(prompt);

		// 4. Call Gemini
		String answer = geminiService.ask(context.toString());

		// 5. Normalize Gemini output
		if (answer.startsWith("```")) {
			answer = answer.replaceAll("^```[a-zA-Z]*", "").replaceAll("```$", "").trim();
		}

		// Optional: basic clean-up before pattern match (optional step)
		answer = answer.replaceAll("\\*\\*", "")
					   .replaceAll("---", "")
					   .replaceAll("//", "")
					   .replaceAll("\\\\n", "\n")
					   .replaceAll("\\n", "\n")
					   .replaceAll("(?m)^\\s+", "");

		List<RetrospectiveResponseDTO> retrospectives = new ArrayList<>();

		// 6. Pattern match Gemini response
		Pattern pattern = Pattern.compile(
			"Sprint Name: (.*?)\\s+" +
			"(?:Sprint ID: .*?\\s+)?" +  // Optional line for Sprint ID
			"What went well: (.*?)\\s+" +
			"What (?:did not|didn’t) go well: (.*?)\\s+" +
			"Suggestions: (.*?)(?=(Sprint Name:|$))",
			Pattern.DOTALL | Pattern.CASE_INSENSITIVE
		);

		Matcher matcher = pattern.matcher(answer);
		while (matcher.find()) {
			RetrospectiveResponseDTO dto = new RetrospectiveResponseDTO();
			dto.setSprintName(cleanText(matcher.group(1)));
			dto.setWhatWentWell(cleanText(matcher.group(2)));
			dto.setWhatDidNotGoWell(cleanText(matcher.group(3)));
			dto.setSuggestions(cleanText(matcher.group(4)));
			retrospectives.add(dto);
		}

		return ResponseEntity.ok(retrospectives);
	}
	
	private String cleanText(String input) {
		return input
			.replaceAll("\\*\\*", "")     // remove markdown bold
			.replaceAll("---", "")        // remove separators
			.replaceAll("//", "")         // remove comment markers
			.replaceAll("\\\\n", " ")     // escaped newlines
			.replaceAll("\\n", " ")       // normal newlines
			.replaceAll("\\s{2,}", " ")   // multiple spaces to single
			.trim();
	}


}