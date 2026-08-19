package com.plotguard.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Entity
@Table(name= "seasons")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Season {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name= "season_id")
    private UUID seasonId;

    @Column(name = "content_id")
    private UUID contentId;

    @Column(name = "season_number")
    private int seasonNumber;

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String text;
}
