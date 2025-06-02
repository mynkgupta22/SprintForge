package com.misogi.SprintForge.controller;

import java.io.IOException;
import java.util.List;

import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.misogi.SprintForge.model.ChunkEmbedding;
import com.misogi.SprintForge.model.User;
import com.misogi.SprintForge.repository.ChunkEmbeddingRepository;
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


//    @PostMapping("/openAI")
//    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
//        try {
//            String reply = openAiService.ask(request.getPrompt());
//            return ResponseEntity.ok(new ChatResponse(reply));
//        } catch (IOException e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(new ChatResponse("Error: " + e.getMessage()));
//        }
//    }
//    
//    @PostMapping("/gemini")
//    public ResponseEntity<?> chatgemini(@RequestBody Map<String, String> request) {
//        try {
//            String response = geminiService.ask(request.get("prompt"));
//            return ResponseEntity.ok(Map.of("response", response));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                                 .body(Map.of("error", e.getMessage()));
//        }
//    }
    
    @PostMapping("/upload")
    public ResponseEntity<String> uploadDocument() throws BadRequestException {
        // fallback to UUID if no sourceId provided
    	User currentUser = ContextService.getCurrentUser();
    	
    	if(currentUser == null) {
    		throw new BadRequestException("Something Went Wrong !");
    	}
//        chunkStorageService.processAndStore(currentUser);
        return ResponseEntity.ok("Document processed and stored successfully with source: " + currentUser.getFirstName());
    }
    
//    @GetMapping("/sources")
//    public ResponseEntity<List<String>> getAllSourceIds() {
//        List<String> sources = chunkStorageService.getAllSourceIds();
//        return ResponseEntity.ok(sources);
//    }

    
//    @PostMapping
//    public ResponseEntity<String> handleQuery(@RequestBody QueryRequest request) throws IOException {
//    	User currentUser = ContextService.getCurrentUser();
//    	
//    	if(currentUser == null) {
//    		throw new BadRequestException("Something Went Wrong !");
//    	}
//    	String source = currentUser.getId().toString();
//    	
//    	if(currentUser == null) {
//    		throw new BadRequestException("Something Went Wrong !");
//    	}
//    	
//    	// 1. Get vector for query using Python microservice
//        List<Double> queryVector = embeddingService.getEmbedding(request.getQuestion());
//
////        System.out.println("Vector: " + queryVector);
////        System.out.println("SourceId: " + request.getSourceId());
//
//        // Call the custom repository method
//        List<ChunkEmbedding> topChunks = repository.findSimilarByVector(queryVector, source);
//
//        // 3. Build context from those chunks
//        StringBuilder context = new StringBuilder("Context:\n");
//        for (int i = 0; i < topChunks.size(); i++) {
//            context.append(i + 1).append(". ").append(topChunks.get(i).getChunkText()).append("\n\n");
//        }
//
//        context.append("User Question: ").append(request.getQuestion());
//
//        // 4. Call Gemini
//        String answer = geminiService.ask(context.toString());
//
//        return ResponseEntity.ok(answer);
//    }
}
