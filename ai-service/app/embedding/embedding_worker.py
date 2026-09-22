import psycopg

from app.config.config import DATABASE_URL
from app.embedding.embedding_service import EmbeddingService
from app.container.service_container import ServiceContainer


service_container = ServiceContainer.get_service_container()

class EmbeddingWorker:
    def __init__(self):
        self.embedding_service = service_container.get_embedding_service()
        self.connection_string = DATABASE_URL

    def process(self,batch_size: int = 20):
        chunks = self._get_pending_chunks(batch_size)
        if not chunks:
            print("No pending chunks.")
            return
        chunk_ids = [
            chunk[0]
            for chunk in chunks
        ]
        try:
            self._mark_processing(chunk_ids)
            texts = [
                chunk[1]
                for chunk in chunks
            ]
            embeddings = self.embedding_service.embed_texts(texts)
            self._save_embeddings(chunks,embeddings)
            print(f"Embedded {len(chunks)} chunks.")
        except Exception as e:
            self._mark_failed(chunk_ids)
            print(f"Embedding failed: {e}")
            raise

    def _get_pending_chunks(self, batch_size: int):
        with psycopg.connect(self.connection_string) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                        chunk_id,
                        chunk_text
                    FROM knowledge_chunks
                    WHERE embedding_status != 'COMPLETED'
                    ORDER BY created_at
                    LIMIT %s
                    """,
                    (batch_size,)
                )

                return cursor.fetchall()

    def _mark_processing(self,chunk_ids):
        with psycopg.connect(self.connection_string) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE knowledge_chunks
                    SET embedding_status = 'PROCESSING'
                    WHERE chunk_id = ANY(%s)
                    """,
                    (chunk_ids,)
                )

    def _save_embeddings(self, chunks, embeddings):
        with psycopg.connect(self.connection_string) as conn:
            with conn.cursor() as cursor:
                for chunk, embedding in zip(
                    chunks,
                    embeddings
                ):
                    chunk_id = chunk[0]
                    cursor.execute(
                        """
                        UPDATE knowledge_chunks
                        SET embedding = %s::vector,
                        embedding_status = 'COMPLETED'
                        WHERE chunk_id = %s
                        """,
                        (
                            embedding,
                            chunk_id
                        )
                    )

    def _mark_failed(self, chunk_ids):
        with psycopg.connect(self.connection_string) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE knowledge_chunks
                    SET embedding_status = 'FAILED'
                    WHERE chunk_id = ANY(%s)
                    """,
                    (chunk_ids,)
                )