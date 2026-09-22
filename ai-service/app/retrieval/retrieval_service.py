from dataclasses import dataclass
import psycopg
from app.config.config import DATABASE_URL


@dataclass
class RetrievedChunk:
    chunk_id: str
    chunk_text: str
    story_order: int
    distance: float


class RetrievalService:
    def retrieve(
        self,
        content_id: str,
        max_story_order: int,
        query_embedding: list[float],
        top_k: int = 5
    ) -> list[RetrievedChunk]:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                        kc.chunk_id,
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
                chunk_text=row[1],
                story_order=row[2],
                distance=row[3]
            )
            for row in rows
        ]