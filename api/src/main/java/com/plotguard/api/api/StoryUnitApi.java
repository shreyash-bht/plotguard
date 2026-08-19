package com.plotguard.api.api;

import com.plotguard.api.dto.NewStoryUnitDto;
import com.plotguard.api.entity.StoryUnit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.naming.directory.InvalidAttributesException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class StoryUnitApi {
    @Autowired
    private StoryUnitApiService storyUnitApiService;

    @GetMapping("/contents/{contentId}/story-units")
    public List<StoryUnit> getAllStoryUnitByContent(@PathVariable UUID contentId) {
        return storyUnitApiService.getAllStoryUnitByContent(contentId);
    }

    @PostMapping("/contents/{contentId}/story-units")
    public StoryUnit addStoryUnit(@PathVariable UUID contentId, @RequestBody NewStoryUnitDto newStoryUnitDto) throws InvalidAttributesException {
        return storyUnitApiService.addStoryUnitToContent(contentId, newStoryUnitDto);
    }
}
