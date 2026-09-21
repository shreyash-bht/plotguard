from pydantic import BaseModel


class ConversationResponse(BaseModel):
    user_id: str
    content_id: str
    max_story_order: int
    conversation_id: str