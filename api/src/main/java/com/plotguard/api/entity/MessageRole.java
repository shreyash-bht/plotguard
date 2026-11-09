package com.plotguard.api.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Author of a chat message. Persisted lowercase because the messages table
 * enforces CHECK (role IN ('user', 'assistant')).
 */
public enum MessageRole {
    USER,
    ASSISTANT;

    @Converter
    public static class LowercaseConverter implements AttributeConverter<MessageRole, String> {
        @Override
        public String convertToDatabaseColumn(MessageRole attribute) {
            return attribute == null ? null : attribute.name().toLowerCase();
        }

        @Override
        public MessageRole convertToEntityAttribute(String dbData) {
            return dbData == null ? null : MessageRole.valueOf(dbData.toUpperCase());
        }
    }
}
