package com.plotguard.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(name= "knowledge_chunks")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KnowledgeChunk {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name= "chunk_id")
    private UUID chunkId;

    @Column(name = "story_unit_id")
    private UUID storyUnitId;

    @Column(name = "chunk_index")
    private Integer chunkIndex;

    @Column(name = "chunk_text")
    private String chunkText;

    @Column(name = "token_count")
    private Integer tokenCount;

    @CreationTimestamp
    @Column(name = "createdAt", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updatedAt", nullable = false)
    private Instant updatedAt;
}
