package com.plotguard.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.plotguard.api.entity.ContentType;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@JsonIgnoreProperties
@AllArgsConstructor
@NoArgsConstructor
public class NewContentDto {
    @JsonProperty("content_id")
    private UUID contentId;

    @JsonProperty("title")
    @NonNull
    private String title;

    @JsonProperty("description")
    @NonNull
    private String description;

    @JsonProperty("content_type")
    @NonNull
    private ContentType contentType;

    @JsonProperty("release_date")
    private LocalDate releaseDate;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;
}