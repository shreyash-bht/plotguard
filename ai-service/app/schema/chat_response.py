from pydantic import BaseModel
from app.schema.chat_metadata import ChatMetadata


class ChatResponse(BaseModel):
    answer: str
    chat_metadata: ChatMetadata | None