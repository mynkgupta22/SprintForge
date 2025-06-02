package com.misogi.SprintForge.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.misogi.SprintForge.model.ChunkEmbedding;

public interface ChunkEmbeddingRepository extends JpaRepository<ChunkEmbedding, Long>, ChunkEmbeddingRepositoryCustom  {

//	@Query(value = """
//		    SELECT * FROM chunk_embedding
//		    WHERE (:sourceId IS NULL OR source = :sourceId)
//		    ORDER BY vector <-> CAST(:vector AS vector)
//		    LIMIT 3
//		""", nativeQuery = true)
//		List<ChunkEmbedding> findSimilar(@Param("vector") String vector, @Param("sourceId") String sourceId);


}