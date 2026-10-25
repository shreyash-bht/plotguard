from sentence_transformers import CrossEncoder
from app.retrieval.models import RetrievedChunk


class ChunkReranker:
    def __init__(self):
        self.model = CrossEncoder(
            "cross-encoder/ms-marco-MiniLM-L6-v2",
            max_length=512,
            device="cpu",
        )

    def rerank(
        self,
        query: str,
        chunks: list[RetrievedChunk],
        top_k: int = 5,
    ) -> list[RetrievedChunk]:
        if not chunks or top_k <= 0:
            return []

        pairs = [
            (query, chunk.chunk_text)
            for chunk in chunks
        ]

        scores = self.model.predict(
            pairs,
            batch_size=8,
            show_progress_bar=False,
        )

        ranked = sorted(
            zip(chunks, scores),
            key=lambda item: float(item[1]),
            reverse=True,
        )

        for chunk, score in ranked:
            chunk.rerank_score = float(score)

        return [chunk for chunk, _ in ranked[:5]]        

       