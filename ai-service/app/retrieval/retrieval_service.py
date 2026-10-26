from dataclasses import dataclass
import psycopg
from app.retrieval.reranker import ChunkReranker
from app.retrieval.models import RetrievedChunk


class RetrievalService:
    def __init__(self, database_url: str, chunk_reranker: ChunkReranker, enable_reranking: bool):
        self._database_url = database_url
        self.reranker = chunk_reranker
        self._enable_reranking = enable_reranking

    def retrieve_relevant_chunks(
        self,
        query: str,
        content_id: str,
        max_story_order: int,
        query_embedding: list[float],
        enable_reranking: bool | None = None,
        top_k: int = 5
    )-> list[RetrievedChunk]:
        should_rerank = self._enable_reranking if enable_reranking is None else enable_reranking
        print(f"hey config {self._enable_reranking} and enable {enable_reranking}")
        if should_rerank:
            retrieved_chunks = self.retrieve(content_id, max_story_order, query_embedding, 20)
            return self.reranker.rerank(query, retrieved_chunks, top_k)
        return self.retrieve(content_id, max_story_order, query_embedding, top_k)

    def retrieve(
        self,
        content_id: str,
        max_story_order: int,
        query_embedding: list[float],
        top_k: int = 20
    ) -> list[RetrievedChunk]:
        with psycopg.connect(self._database_url) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                        kc.chunk_id,
                        kc.chunk_index,
                        kc.chunk_text,
                        su.story_order,
                        kc.embedding <=> %s::vector AS distance
                    FROM knowledge_chunks kc
                    JOIN story_units su
                        ON su.story_unit_id = kc.story_unit_id
                    WHERE su.content_id = %s
                      AND su.story_order <= %s
                      AND kc.embedding_status = 'COMPLETED'
                      AND kc.embedding IS NOT NULL
                    ORDER BY kc.embedding <=> %s::vector
                    LIMIT %s
                    """,
                    (
                        query_embedding,
                        content_id,
                        max_story_order,
                        query_embedding,
                        top_k,
                    )
                )
                rows = cursor.fetchall()

        return [
            RetrievedChunk(
                chunk_id=str(row[0]),
                chunk_index=row[1],
                chunk_text=row[2],
                story_order=row[3],
                distance=row[4]
            )
            for row in rows
        ]