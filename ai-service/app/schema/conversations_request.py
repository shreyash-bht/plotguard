from pydantic import BaseModel


class ConversationRequest(BaseModel):
    user_id: str
    content_id: str
    max_story_order: int