package com.plotguard.api.repository;

import com.plotguard.api.entity.KnowledgeChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface KnowledgeChunkRepository extends JpaRepository<KnowledgeChunk, UUID> {
    List<KnowledgeChunk> findByStoryUnitIdOrderByChunkIndexAsc(UUID storyUnitId);
    @Query(value = """
        SELECT MAX(chunk_index)
        FROM knowledge_chunks
        WHERE story_unit_id = :storyUnitId
        """,
            nativeQuery = true
    )
    Optional<Integer> findMaxChunkIndexByStoryUnitId(
            @Param("storyUnitId") UUID storyUnitId
    );
}
