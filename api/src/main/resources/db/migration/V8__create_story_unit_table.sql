CREATE TABLE story_units (
    story_unit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES contents(content_id) ON DELETE CASCADE,
    season_id UUID REFERENCES seasons(season_id) ON DELETE SET NULL,
    unit_type VARCHAR(30) NOT NULL,
    unit_number INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    story_order INT NOT NULL,
    release_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_id, story_order)
);