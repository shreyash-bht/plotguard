package com.plotguard.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Entity
@Table(name= "story_units")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StoryUnit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name= "story_unit_id")
    private UUID storyUnitId;

    @Column(name = "content_id")
    private UUID contentId;

    @Column(name = "season_id")
    private UUID seasonId;

    @Column(name = "unit_type")
    private StoryUnitType storyUnitType;

    @Column(name = "unit_number")
    private int unitNumber;

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "story_order")
    private int storyOrder;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
