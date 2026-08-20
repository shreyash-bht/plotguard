package com.plotguard.api.api;

import com.plotguard.api.dto.NewStoryUnitDto;
import com.plotguard.api.entity.StoryUnit;
import com.plotguard.api.repository.StoryUnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.naming.directory.InvalidAttributesException;
import java.util.List;
import java.util.UUID;

@Service
public class StoryUnitApiService {
    @Autowired
    private StoryUnitRepository storyUnitRepository;

    public List<StoryUnit> getAllStoryUnitByContent(UUID contentId) {
        return storyUnitRepository.findAllByContentId(contentId);
    }

    public StoryUnit addStoryUnitToContent(UUID contentId, NewStoryUnitDto newStoryUnitDto) throws InvalidAttributesException {
        if(!contentId.equals(newStoryUnitDto.getContentId()))
            throw new InvalidAttributesException("Content Ids don't match");
        int nextStoryOrder = storyUnitRepository.findMaxStoryOrderByContentId(contentId).orElse(0) + 1;
        StoryUnit newStoryUnit = StoryUnit.builder()
                .contentId(contentId)
                .seasonId(newStoryUnitDto.getSeasonId())
                .storyUnitType(newStoryUnitDto.getStoryUnitType())
                .unitNumber(newStoryUnitDto.getUnitNumber())
                .title(newStoryUnitDto.getTitle())
                .description(newStoryUnitDto.getDescription())
                .storyOrder(nextStoryOrder)
                .releaseDate(newStoryUnitDto.getReleaseDate())
                .build();
        return storyUnitRepository.save(newStoryUnit);
    }
}
