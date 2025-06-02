package com.misogi.SprintForge.repository;

import java.util.List;

import com.misogi.SprintForge.model.ChunkEmbedding;

public interface ChunkEmbeddingRepositoryCustom {
    List<ChunkEmbedding> findSimilarByVector(List<Double> vector, String sourceId);
}