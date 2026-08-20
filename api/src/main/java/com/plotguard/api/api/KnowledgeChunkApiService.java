package com.plotguard.api.api;

import com.plotguard.api.dto.NewKnowledgeChunkDto;
import com.plotguard.api.entity.KnowledgeChunk;
import com.plotguard.api.repository.KnowledgeChunkRepository;
import com.plotguard.api.repository.StoryUnitRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class KnowledgeChunkApiService {
    private final KnowledgeChunkRepository knowledgeChunkRepository;
    private final StoryUnitRepository storyUnitRepository;

    public KnowledgeChunkApiService(KnowledgeChunkRepository knowledgeChunkRepository,
                                    StoryUnitRepository storyUnitRepository) {

        this.knowledgeChunkRepository = knowledgeChunkRepository;
        this.storyUnitRepository = storyUnitRepository;
    }

    public KnowledgeChunk addKnowledgeChunk(UUID storyUnitId,
            NewKnowledgeChunkDto dto) {
        storyUnitRepository
                .findById(storyUnitId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Story unit not found"));
        int nextChunkIndex = knowledgeChunkRepository.findMaxChunkIndexByStoryUnitId(storyUnitId)
                .orElse(-1) + 1;
        KnowledgeChunk chunk = KnowledgeChunk.builder()
                .storyUnitId(storyUnitId)
                .chunkIndex(nextChunkIndex)
                .chunkText(dto.getChunkText())
                .tokenCount(dto.getTokenCount())
                .build();
        return knowledgeChunkRepository.save(chunk);
    }

    public List<KnowledgeChunk> getKnowledgeChunks(UUID storyUnitId) {
        return knowledgeChunkRepository.findByStoryUnitIdOrderByChunkIndexAsc(storyUnitId);
    }
}