import pandas as pd
from evaluation.models.retrieval_models import RetrievalCase
from pathlib import Path


class RetrievalDatasetLoader:
    def __init__(self):
        self._path = f"{Path(__file__).resolve().parent.parent}/resources/retrieval_queries.csv"
        
    def load(self) -> list[RetrievalCase]:
        dataframe = pd.read_csv(self._path)
        return [
            RetrievalCase(
                id=row["id"],
                query=row["query"],
                relevant_episodes=self._parse_values(
                    row["relevant_episodes"]
                ),
                relevant_chunks=self._parse_values(
                    row["relevant_chunks"]
                ),
                max_story_order=int(row["max_story_order"]),
                content_id=row["content_id"],
            )
            for _, row in dataframe.iterrows()
        ]

    @staticmethod
    def _parse_values(value) -> set[str]:
        if pd.isna(value):
            return set()

        return {
            item.strip()
            for item in str(value).split()
            if item.strip()
        }