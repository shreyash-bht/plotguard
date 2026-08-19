package com.plotguard.api.api;

import com.plotguard.api.dto.NewContentDto;
import com.plotguard.api.entity.Content;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/contents")
public class ContentApi {
    @Autowired
    private ContentApiService contentApiService;

    @GetMapping("")
    public List<Content> getAllContents() {
        return contentApiService.getAllContents();
    }

    @PostMapping("")
    public Content addContent(@RequestBody NewContentDto newContentDto) {
        return contentApiService.addContent(newContentDto);
    }

    @GetMapping("/{contentId}")
    public Content getContent(@PathVariable UUID contentId) {
        return contentApiService.getContent(contentId);
    }

    @GetMapping("/name/{title}")
    public Content getContentByName(@PathVariable String title) {
        return contentApiService.getContentByTitle(title);
    }
}
