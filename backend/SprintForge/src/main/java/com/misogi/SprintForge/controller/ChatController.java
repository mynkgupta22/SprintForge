package com.misogi.SprintForge.controller;

import java.io.IOException;
import java.util.List;

import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.misogi.SprintForge.dto.ProjectSprintTaskDTO;
import com.misogi.SprintForge.dto.QueryDTO;
import com.misogi.SprintForge.model.ChunkEmbedding;
import com.misogi.SprintForge.model.User;
import com.misogi.SprintForge.repository.ChunkEmbeddingRepository;
import com.misogi.SprintForge.service.ProjectService;
import com.misogi.SprintForge.service.contextService;
import com.misogi.SprintForge.service.ai.EmbeddingAddService;
import com.misogi.SprintForge.service.ai.EmbeddingService;
import com.misogi.SprintForge.service.ai.GeminiService;


@RestController
@RequestMapping("/api/chat")
public class ChatController {

//	@Autowired
//    private OpenAiService openAiService;
//	
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
    
    
    @PostMapping("/get-data/{projectId}")
    public ResponseEntity<String> uploadDocument(@PathVariable Long projectId) throws BadRequestException {
    	ProjectSprintTaskDTO info = projectService.getProjectEmbedded(projectId);
    	String prompt =  String.format("""
    	        
    	        You are a data summarization assistant. I will provide you with structured data of a software project that includes project details, its sprints, and associated tasks (including backlog tasks). Each task may have details like title, status, priority, due date, assignee, etc.

    	        Your job is to convert this structured data into a clear, natural language description that is easy to understand, embedding-friendly, and logically chunked. The output will later be used in an AI system for search and retrieval, so keep it concise, rich in information, and grouped by sprint and task.

    	        Format:
    	        1. Start with a brief summary of the project (name, key, and description).
    	        2. Then, for each sprint, describe the sprint’s name, goal, duration, and status.
    	        3. Under each sprint, list all tasks, including their key, title, description, status, priority, story points, estimate, due date, and assignee information.
    	        4. After the sprints, list the backlog tasks that are not assigned to any sprint.
    	        5. Write everything in natural, human-like language suitable for AI understanding and semantic embedding.

    	        Now here is the structured DTO data:
    	        %s
    	        """, info);


    	
    	try {
			String data = geminiService.ask(prompt);
			chunkStorageService.processAndStore(projectId, data);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    	
//        chunkStorageService.processAndStore(currentUser);
        return ResponseEntity.ok("Document processed and stored successfully with source: " );
    }
    
    @PostMapping
    public ResponseEntity<String> handleQuery(@RequestBody QueryDTO request) throws IOException {
    	
    	String source = request.getProjectId().toString();
  	
    	// 1. Get vector for query using Python microservice
        List<Double> queryVector = embeddingService.getEmbedding(request.getQuestion());


        // Call the custom repository method
        List<ChunkEmbedding> topChunks = repository.findSimilarByVector(queryVector, source);

        // 3. Build context from those chunks
        StringBuilder context = new StringBuilder("Context:\n");
        for (int i = 0; i < topChunks.size(); i++) {
            context.append(i + 1).append(". ").append(topChunks.get(i).getChunkText()).append("\n\n");
        }

        context.append("User Question: ").append(request.getQuestion());

        // 4. Call Gemini
        String answer = geminiService.ask(context.toString());

        return ResponseEntity.ok(answer);
    }
    

}
