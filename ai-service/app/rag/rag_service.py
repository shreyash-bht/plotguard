from app.embedding.embedding_service import EmbeddingService
from app.retrieval.retrieval_service import RetrievalService
from dataclasses import dataclass
from app.retrieval.retrieval_service import RetrievedChunk


@dataclass
class RAGResult: 
    context: str
    retrieved_chunks: list[RetrievedChunk]


class RAGService:
    def __init__(self, embedding_service: EmbeddingService, retrieval_service: RetrievalService):
        self.embedding_service = embedding_service
        self.retrieval_service = retrieval_service

    def retrieve_context(
        self,
        content_id: str,
        max_story_order: int,
        query: str,
        enable_reranking: bool, 
        top_k: int = 5
    ) -> RAGResult:
        query_embedding = self.embedding_service.embed_query(query)
        chunks = self.retrieval_service.retrieve_relevant_chunks(query, content_id, max_story_order, query_embedding, enable_reranking, top_k)
        context = self._build_context(chunks)
        return RAGResult(context, chunks)

    def _build_context(self, chunks) -> str:
        return "\n\n".join(
            f"[Story Order: {chunk.story_order}]\n"
            f"{chunk.chunk_text}"
            for chunk in chunks
        )