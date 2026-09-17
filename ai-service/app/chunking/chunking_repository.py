import psycopg

from app.config import DATABASE_URL


class ChunkingRepository:
    def save_chunks(self, story_unit_id: str, chunks: list[str]) -> int:
        if not chunks:
            return 0
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cursor:
                for chunk_index, chunk_text in enumerate(chunks):
                    cursor.execute(
                        """
                        INSERT INTO knowledge_chunks (
                            story_unit_id,
                            chunk_index,
                            chunk_text,
                            embedding_status
                        )
                        VALUES (
                            %s,
                            %s,
                            %s,
                            'PENDING'
                        )
                        """,
                        (
                            story_unit_id,
                            chunk_index,
                            chunk_text
                        )
                    )
        return len(chunks)

    def get_chunks(self, story_unit_id: str) -> list[str]:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                        chunk_id,
                        chunk_text
                    FROM knowledge_chunks
                    WHERE story_unit_id = %s
                    ORDER BY chunk_index
                    """,
                    (story_unit_id,)
                )

                return cursor.fetchall()
