package com.plotguard.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.UUID;

@Data
@Builder
@JsonIgnoreProperties
@AllArgsConstructor
@NoArgsConstructor
public class NewSeasonDto {
    @JsonProperty("season_id")
    private UUID seasonId;

    @JsonProperty("content_id")
    @NonNull
    private UUID contentId;

    @JsonProperty("season_number")
    @NonNull
    private Integer seasonNumber;

    @JsonProperty("title")
    private String title;

    @JsonProperty("description")
    private String description;
}
