package com.plotguard.api.repository;

import com.plotguard.api.entity.Season;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SeasonRepository extends JpaRepository<Season, UUID> {
    List<Season> findAllByContentId(UUID contentId);
}
