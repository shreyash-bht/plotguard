package com.plotguard.api.api;

import com.plotguard.api.dto.NewSeasonDto;
import com.plotguard.api.entity.Season;
import com.plotguard.api.repository.SeasonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.naming.directory.InvalidAttributesException;
import java.util.List;
import java.util.UUID;

@Service
public class SeasonApiService {
    @Autowired
    private SeasonRepository seasonRepository;

    public List<Season> getAllSeasons(UUID contentId) {
        return seasonRepository.findAllByContentId(contentId);
    }

    public Season addSeasonToContent(UUID contentId, NewSeasonDto newSeasonDto) throws InvalidAttributesException {
        if(contentId.equals(newSeasonDto.getContentId()))
            throw new InvalidAttributesException("Content IDs mismatched");
        Season newSeason = Season.builder()
                .contentId(contentId)
                .seasonNumber(newSeasonDto.getSeasonNumber())
                .title(newSeasonDto.getTitle())
                .description(newSeasonDto.getDescription())
                .build();
        return seasonRepository.save(newSeason);
    }
}
