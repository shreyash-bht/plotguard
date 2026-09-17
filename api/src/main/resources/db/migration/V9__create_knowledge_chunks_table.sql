CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE knowledge_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_unit_id UUID NOT NULL,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    token_count INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    embedding vector(1024),
    embedding_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    CONSTRAINT fk_knowledge_chunks_story_unit FOREIGN KEY (story_unit_id)
        REFERENCES story_units(story_unit_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_chunk_index CHECK (chunk_index >= 0),
    CONSTRAINT uq_story_unit_chunk UNIQUE (story_unit_id, chunk_index),
    CONSTRAINT chk_embedding_status
            CHECK (embedding_status IN (
                'PENDING',
                'PROCESSING',
                'COMPLETED',
                'FAILED'
            ))
);