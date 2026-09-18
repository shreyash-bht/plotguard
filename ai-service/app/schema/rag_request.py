from pydantic import BaseModel, Field


class RAGRequest(BaseModel):
    content_id: str
    max_story_order: int = Field(ge=0)
    question: str = Field(min_length=1)