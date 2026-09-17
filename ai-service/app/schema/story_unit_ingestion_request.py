from pydantic import BaseModel, Field


class StoryUnitIngestionRequest(BaseModel):
    content_id: str
    story_unit_id: str
    story_unit_text: str = Field(min_length=1)