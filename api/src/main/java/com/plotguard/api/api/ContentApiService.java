package com.plotguard.api.api;

import com.plotguard.api.dto.NewContentDto;
import com.plotguard.api.entity.Content;
import com.plotguard.api.repository.ContentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ContentApiService {
    @Autowired
    private ContentRepository contentRepository;

    public List<Content> getAllContents() {
        return contentRepository.findAll();
    }

    public Content addContent(NewContentDto newContentDto) {
        Content newContent = Content.builder()
                .contentType(newContentDto.getContentType())
                .title(newContentDto.getTitle())
                .description(newContentDto.getDescription())
                .releaseDate(newContentDto.getReleaseDate())
                .build();
        return contentRepository.save(newContent);
    }

    public Content getContent(UUID contentId) {
        Optional<Content> content = contentRepository.findById(contentId);
        if(content.isEmpty())
            throw new EntityNotFoundException("Content with given ID does not exist");
        return content.get();
    }

    public Content getContentByTitle(String title) {
        Optional<Content> content = contentRepository.findByTitle(title);
        if(content.isEmpty())
            throw new EntityNotFoundException("Content with given title does not exist");
        return content.get();
    }
}
