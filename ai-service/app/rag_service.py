from app.embedding.embedding_service import EmbeddingService
from app.retrieval.retrieval_service import RetrievalService
from app.llm.llm_service import LLMService


class RAGService:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.retrieval_service = RetrievalService()
        self.llm_service = LLMService()

    def answer(
        self,
        content_id: str,
        max_story_order: int,
        question: str,
        top_k: int = 5
    ) -> str:
        # 1. Convert question into an embedding
        query_embedding = self.embedding_service.embed_query(question)
        # 2. Retrieve relevant chunks within spoiler boundary
        chunks = self.retrieval_service.retrieve(
            content_id=content_id,
            max_story_order=max_story_order,
            query_embedding=query_embedding,
            top_k=top_k
        )

        if not chunks:
            return "I couldn't find enough information to answer that."

        # 3. Build context for the LLM
        context = self._build_context(chunks)

        # 4. Generate answer
        return self.llm_service.answer(
            question=question,
            context=context
        )

    def _build_context(self, chunks) -> str:
        return "\n\n".join(
            f"[Story Order: {chunk.story_order}]\n"
            f"{chunk.chunk_text}"
            for chunk in chunks
        )