from app.embedding.embedding_service import EmbeddingService
from app.retrieval.retrieval_service import RetrievalService

from evaluation.evaluators.evaluator import Evaluator
from evaluation.loaders.retrieval_dataset_loader import RetrievalDatasetLoader
from evaluation.models.retrieval_models import (
    RetrievalCaseResult,
    RetrievalEvaluationResult,
)


class RetrievalEvaluator(Evaluator):
    def __init__(
        self,
        embedding_service: EmbeddingService,
        retrieval_service: RetrievalService,
    ):
        self._dataset_loader = RetrievalDatasetLoader()
        self._embedding_service = embedding_service
        self._retrieval_service = retrieval_service
        self._top_k = 3

    def evaluate(self) -> RetrievalEvaluationResult:
        cases = self._dataset_loader.load()
        results = [
            self._evaluate_case(case)
            for case in cases
        ]
        return self._build_result(results)

    def _evaluate_case(self, case):
        query_embedding = self._embedding_service.embed_query(
            case.query
        )

        retrieved_chunks = self._retrieval_service.retrieve(
            content_id=case.content_id,
            max_story_order=case.max_story_order,
            query_embedding=query_embedding,
            top_k=self._top_k,
        )

        retrieved_episodes = {
            f"e{chunk.story_order}"
            for chunk in retrieved_chunks
        }

        retrieved_chunk_ids = {
            f"e{chunk.story_order}-c{chunk.chunk_index}"
            for chunk in retrieved_chunks
        }

        recall = self._calculate_recall(
            expected=case.relevant_chunks,
            actual=retrieved_chunk_ids,
        )

        precision = self._calculate_precision(
            expected=case.relevant_chunks,
            actual=retrieved_chunk_ids,
        )

        return RetrievalCaseResult(
            case_id=case.id,
            query=case.query,
            expected_episodes=case.relevant_episodes,
            retrieved_episodes=retrieved_episodes,
            expected_chunks=case.relevant_chunks,
            retrieved_chunks=retrieved_chunk_ids,
            recall=recall,
            precision=precision,
        )

    @staticmethod
    def _calculate_recall(
        expected: set[str],
        actual: set[str],
    ) -> float:
        if not expected:
            return 0.0

        return len(expected & actual) / len(expected)

    @staticmethod
    def _calculate_precision(
        expected: set[str],
        actual: set[str],
    ) -> float:
        if not actual:
            return 0.0

        return len(expected & actual) / len(actual)

    @staticmethod
    def _build_result(
        results: list[RetrievalCaseResult],
    ) -> RetrievalEvaluationResult:

        if not results:
            return RetrievalEvaluationResult(
                total_cases=0,
                recall=0.0,
                precision=0.0,
                cases=[],
            )

        return RetrievalEvaluationResult(
            total_cases=len(results),
            recall=sum(r.recall for r in results) / len(results),
            precision=sum(r.precision for r in results) / len(results),
            cases=results,
        )