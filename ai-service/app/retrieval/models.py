from dataclasses import dataclass


@dataclass
class RetrievedChunk:
    chunk_id: str
    chunk_index: int
    chunk_text: str
    story_order: int
    distance: float
    rerank_score : float | None = None
