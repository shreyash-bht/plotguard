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
public class NewConversationDto {
    @JsonProperty("conversation_id")
    private UUID conversationId;

    @JsonProperty("user_id")
    @NonNull
    private UUID userId;

    @JsonProperty("content_id")
    @NonNull
    private UUID contentId;

    @JsonProperty("max_story_order")
    @NonNull
    private Integer maxStoryOrder;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;
}
