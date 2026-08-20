package com.plotguard.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
    @Enumerated(EnumType.STRING)
    private StoryUnitType storyUnitType;

    @Column(name = "unit_number")
    private int unitNumber;

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "story_order")
    private Integer storyOrder;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
