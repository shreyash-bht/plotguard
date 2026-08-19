package com.plotguard.api.api;

import com.plotguard.api.dto.NewSeasonDto;
import com.plotguard.api.entity.Season;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.naming.directory.InvalidAttributesException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/contents")
public class SeasonApi {
    @Autowired
    private SeasonApiService seasonApiService;

    @GetMapping("/{contentId}/seasons")
    public List<Season> getAllSeasons (@PathVariable UUID contentId){
        return seasonApiService.getAllSeasons(contentId);
    }

    @PostMapping("/{contentId}/seasons")
    public Season addSeason(@PathVariable UUID contentId, @RequestBody NewSeasonDto newSeasonDto) throws InvalidAttributesException {
        return seasonApiService.addSeasonToContent(contentId, newSeasonDto);
    }
}
