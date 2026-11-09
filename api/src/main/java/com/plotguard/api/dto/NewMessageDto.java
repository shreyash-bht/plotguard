package com.plotguard.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.plotguard.api.entity.MessageRole;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@JsonIgnoreProperties
@AllArgsConstructor
@NoArgsConstructor
public class NewMessageDto {
    @JsonProperty("message_id")
    private UUID messageId;

    @JsonProperty("conversation_id")
    private UUID conversationId;

    @JsonProperty("user_id")
    @NonNull
    private UUID userId;

    @JsonProperty("role")
    private MessageRole role;

    @JsonProperty("original_content")
    @NonNull
    private String originalContent;

    @JsonProperty("contextualized_content")
    private String contextualizedContent;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;
}
