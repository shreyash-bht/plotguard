CREATE TABLE seasons (
    season_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES contents(content_id) ON DELETE CASCADE,
    season_number INT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    UNIQUE(content_id, season_number)
);