from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    conversation_id: str
    content_id: str
    max_story_order: int = Field(ge=0)
    user_question: str = Field(min_length=1)