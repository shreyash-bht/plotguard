package com.plotguard.api.api;

import com.plotguard.api.dto.NewKnowledgeChunkDto;
import com.plotguard.api.entity.KnowledgeChunk;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/story-units")
public class KnowledgeChunkApi {
    @Autowired
    private KnowledgeChunkApiService knowledgeChunkApiService;

    @PostMapping("/{storyUnitId}/knowledge-chunks")
    public KnowledgeChunk addKnowledgeChunk(@PathVariable UUID storyUnitId, @RequestBody NewKnowledgeChunkDto dto) {
        return knowledgeChunkApiService.addKnowledgeChunk(storyUnitId, dto);
    }

    @GetMapping("/{storyUnitId}/knowledge-chunks")
    public List<KnowledgeChunk> getKnowledgeChunks(@PathVariable UUID storyUnitId) {
        return knowledgeChunkApiService.getKnowledgeChunks(storyUnitId);
    }
}