from app.embedding.embedding_service import EmbeddingService
from app.retrieval.retrieval_service import RetrievalService
from dataclasses import dataclass
from app.retrieval.retrieval_service import RetrievedChunk
from app.schema.routed_query import RoutedQuery


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
        routed_query: RoutedQuery,
        enable_reranking: bool, 
        top_k: int = 5
    ) -> RAGResult:
        # FACTUAL keeps top_k small on purpose: a brief fact needs at most a
        # couple of chunks, and more context only dilutes a 1-2 sentence answer.
        if routed_query.intent == "FACTUAL":
            top_k = min(top_k, 3)
        query_embedding = self.embedding_service.embed_query(routed_query.query)
        chunks = self.retrieval_service.retrieve_relevant_chunks(
            routed_query.query,
            content_id,
            max_story_order,
            query_embedding,
            enable_reranking=enable_reranking,
            top_k=top_k,
        )
        context = self._build_context(chunks)
        return RAGResult(context, chunks)

    def _build_context(self, chunks) -> str:
        return "\n\n".join(
            f"[Story Order: {chunk.story_order}]\n"
            f"{chunk.chunk_text}"
            for chunk in chunks
        )