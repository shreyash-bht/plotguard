from pydantic import BaseModel
from app.retrieval.retrieval_service import RetrievedChunk

class TokenUsage(BaseModel):
    input_token: int
    output_token: int
    total_token: int


class ChatMetadata(BaseModel):
    contextualized_query: str
    generation_time_seconds: float = 0.0
    token_usage: TokenUsage = None
    used_chunks: list[RetrievedChunk] = None



