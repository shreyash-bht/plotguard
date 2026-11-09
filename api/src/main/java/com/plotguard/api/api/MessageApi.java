package com.plotguard.api.api;

import com.plotguard.api.dto.NewMessageDto;
import com.plotguard.api.entity.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.naming.directory.InvalidAttributesException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversations/{conversationId}/messages")
public class MessageApi {
    @Autowired
    private MessageApiService messageApiService;

    @GetMapping
    public List<Message> getAllMessages(@PathVariable UUID conversationId, @RequestParam("user_id") UUID userId) {
        return messageApiService.getAllMessages(conversationId, userId);
    }

    @PostMapping
    public Message addMessage(@PathVariable UUID conversationId, @RequestBody NewMessageDto newMessageDto) throws InvalidAttributesException {
        return messageApiService.addMessageToConversation(conversationId, newMessageDto);
    }
}
