package com.misogi.SprintForge.service.ai;

import java.util.stream.Collectors;

import org.springframework.data.domain.jaxb.SpringDataJaxb.PageDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.misogi.SprintForge.config.TextChunker;
import com.misogi.SprintForge.dto.ProjectSprintTaskDTO;
import com.misogi.SprintForge.dto.ProjectSprintTaskDTO.SprintsDto;
import com.misogi.SprintForge.dto.ProjectSprintTaskDTO.TasksDto;
import com.misogi.SprintForge.model.Project;
import com.misogi.SprintForge.service.ProjectService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmbeddingAddService {

	 private final TextChunker chunker;
     private final EmbeddingService embeddingService;
     private final JdbcTemplate jdbcTemplate;
     private final ProjectService projectService;

    public void processAndStore(Long projectId) {
    	ProjectSprintTaskDTO info = projectService.getProjectEmbedded(projectId);
    	
    	// ✅ Step 1: Delete existing entries with the same sourceId
        String deleteSql = "DELETE FROM chunk_embedding WHERE source = ?";
        jdbcTemplate.update(deleteSql, projectId.toString());
        
        
        for(SprintsDto si : info.getSprints()) {
            Long sprintId =  si.getSprintId();
        	for(TasksDto ti : si.getTasks()) {
        		Long TaskId = ti.getTaskId();
        	}
        }
        
        for(PageDto info : ing) {
        	String wsUid = info.getWsUid();
        	List<String> chunks = chunker.chunkText(info.getContent(), 500);

            for (String chunk : chunks) {
                List<Double> vector = embeddingService.getEmbedding(chunk);

                // Convert list to pgvector format string: "[0.1, 0.2, 0.3]"
                String pgVectorFormat = vector.stream()
                        .map(String::valueOf)
                        .collect(Collectors.joining(",", "[", "]"));

                // Use native SQL with ::vector cast
                String sql = "INSERT INTO chunk_embedding (chunk_text, source, vector, ws_uid, page_uid) VALUES (?, ?, ?::vector, ?, ? )";
                jdbcTemplate.update(sql, chunk, user.getId().toString(), pgVectorFormat, wsUid, info.getId().toString());
            }
        }  
    }
}
