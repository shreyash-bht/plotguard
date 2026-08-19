package com.plotguard.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.plotguard.api.entity.StoryUnitType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@JsonIgnoreProperties
@AllArgsConstructor
@NoArgsConstructor
public class NewStoryUnitDto {
    @JsonProperty("story_unit_id")
    private UUID storyUnitId;

    @JsonProperty("content_id")
    private UUID contentId;

    @JsonProperty("season_id")
    private UUID seasonId;

    @JsonProperty("unit_type")
    private StoryUnitType storyUnitType;

    @JsonProperty("unit_number")
    private Integer unitNumber;

    @JsonProperty("title")
    private String title;

    @JsonProperty("description")
    private String description;

    @JsonProperty("story_order")
    private Integer storyOrder;

    @JsonProperty("release_date")
    private LocalDate releaseDate;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;
}
