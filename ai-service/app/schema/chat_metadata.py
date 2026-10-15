from pydantic import BaseModel
from langchain_core.messages import UsageMetadata
from app.retrieval.retrieval_service import RetrievedChunk


class ChatMetadata(BaseModel):
    contextualized_query: str = ""
    generation_time_seconds: float = 0.0
    token_usage: UsageMetadata = None
    used_chunks: list[RetrievedChunk] = None



