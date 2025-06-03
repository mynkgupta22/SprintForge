package com.misogi.SprintForge.service.ai;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.misogi.SprintForge.config.TextChunker;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmbeddingAddService {

	 private final TextChunker chunker;
     private final EmbeddingService embeddingService;
     private final JdbcTemplate jdbcTemplate;

    public void processAndStore(Long projectId, String longText) {
    	    	
    	// ✅ Step 1: Delete existing entries with the same sourceId
        String deleteSql = "DELETE FROM chunk_embedding WHERE source = ?";
        jdbcTemplate.update(deleteSql, projectId.toString());
        
        
            	List<String> chunks = chunker.chunkText(longText, 500);
                for (String chunk : chunks) {
                    List<Double> vector = embeddingService.getEmbedding(chunk);

                    // Convert list to pgvector format string: "[0.1, 0.2, 0.3]"
                    String pgVectorFormat = vector.stream()
                            .map(String::valueOf)
                            .collect(Collectors.joining(",", "[", "]"));

                    // Use native SQL with ::vector cast
                    String sql = "INSERT INTO chunk_embedding (chunk_text, source, vector) VALUES (?, ?, ?::vector )";
                    jdbcTemplate.update(sql, chunk, projectId.toString(), pgVectorFormat);
                }
        	}
        
        

        
          
    }

