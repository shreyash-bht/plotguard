from pydantic import BaseModel


class StoryUnitIngestionResponse(BaseModel):
    content_id: str
    story_unit_id: str
    chunks_created: int
    embedding_status: str
