from app.container.service_container import ServiceContainer
from app.embedding.embedding_worker import EmbeddingWorker
from evaluation.data_manager import DataManager
from app.config.config import get_settings
from evaluation.evaluation_runner import EvaluationRunner
from evaluation.evaluators.retrieval_evaluator import RetrievalEvaluator


def main():
    settings = get_settings(profile="evaluation")
    container = ServiceContainer.get_service_container(settings)
    embedding_service = container.get_embedding_service()
    ingestion_service = container.get_ingestion_service() 
    retrieval_service = container.get_retrieval_service()
    data_manager = DataManager(settings.database_url, EmbeddingWorker(settings.database_url, embedding_service), ingestion_service)

    evaluators = [RetrievalEvaluator(
        embedding_service,
        retrieval_service
    )]

    runner = EvaluationRunner(data_manager, evaluators)
    results = runner.run()
    for result in results:
        print(result)

if __name__ == "__main__":
    main()