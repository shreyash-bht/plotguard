package com.plotguard.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@JsonIgnoreProperties
@AllArgsConstructor
@NoArgsConstructor
public class NewKnowledgeChunkDto {
    @JsonProperty("chunk_id")
    private UUID chunkId;

    @JsonProperty("story_unit_id")
    @NonNull
    private UUID storyUnitId;

    @JsonProperty("chunk_index")
    private Integer chunkIndex;

    @JsonProperty("chunk_text")
    @NonNull
    private String chunkText;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;
}
