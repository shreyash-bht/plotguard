package com.plotguard.api.repository;

import com.plotguard.api.entity.StoryUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StoryUnitRepository extends JpaRepository<StoryUnit, UUID> {
    List<StoryUnit> findAllByContentId(UUID contentId);
    Optional <Integer> findMaxStoryOrderByContentId(UUID contentId);
}
