package com.plotguard.api.repository;

import com.plotguard.api.entity.StoryUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StoryUnitRepository extends JpaRepository<StoryUnit, UUID> {
    List<StoryUnit> findAllByContentId(UUID contentId);
    @Query(value = """
        SELECT MAX(story_order)
        FROM story_units
        WHERE content_id = :contentId
        """, nativeQuery = true
    )
    Optional<Integer> findMaxStoryOrderByContentId(
            @Param("contentId") UUID contentId
    );
}
