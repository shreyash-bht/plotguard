package com.plotguard.api.repository;

import com.plotguard.api.entity.Message;
import com.plotguard.api.entity.MessageRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findAllByConversationIdOrderByCreatedAtAsc(UUID conversationId);
    long countByConversationIdAndRole(UUID conversationId, MessageRole role);
}
