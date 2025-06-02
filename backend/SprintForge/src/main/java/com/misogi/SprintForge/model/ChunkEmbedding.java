package com.misogi.SprintForge.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "chunk_embedding")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChunkEmbedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "chunk_text", columnDefinition = "text")
    private String chunkText;

    //here we will store userUid
    @Column(name = "source")
    private String source;

    @Column(name = "vector", columnDefinition = "vector(384)")
    private String vector;
 
}