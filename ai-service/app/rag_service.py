from app.embedding.embedding_service import EmbeddingService
from app.retrieval.retrieval_service import RetrievalService


class RAGService:
    def __init__(self, embedding_service: EmbeddingService, retrieval_service: RetrievalService):
        self.embedding_service = embedding_service
        self.retrieval_service = retrieval_service

    def fetch_relevant_chunks(
        self,
        content_id: str,
        max_story_order: int,
        question: str,
        top_k: int = 5
    ) -> str:
        print(f"rag question asked is : {question}")
        query_embedding = self.embedding_service.embed_query(question)
        chunks = self.retrieval_service.retrieve(
            content_id=content_id,
            max_story_order=max_story_order,
            query_embedding=query_embedding,
            top_k=top_k
        )
        if not chunks:
            return "I couldn't find enough information to answer that."

        context = self._build_context(chunks)
        return context

    def _build_context(self, chunks) -> str:
        return "\n\n".join(
            f"[Story Order: {chunk.story_order}]\n"
            f"{chunk.chunk_text}"
            for chunk in chunks
        )