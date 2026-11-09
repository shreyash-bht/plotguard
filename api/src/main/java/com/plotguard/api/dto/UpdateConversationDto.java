package com.plotguard.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.UUID;

/**
 * Partial update payload for an existing conversation. Currently only the
 * spoiler boundary (max_story_order) is mutable.
 */
@Data
@Builder
@JsonIgnoreProperties
@AllArgsConstructor
@NoArgsConstructor
public class UpdateConversationDto {
    @JsonProperty("conversation_id")
    private UUID conversationId;

    @JsonProperty("user_id")
    @NonNull
    private UUID userId;

    @JsonProperty("max_story_order")
    @NonNull
    private Integer maxStoryOrder;
}
