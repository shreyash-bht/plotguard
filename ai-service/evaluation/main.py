from app.container.service_container import ServiceContainer
from app.embedding.embedding_worker import EmbeddingWorker
from evaluation.data_manager import DataManager
from app.config.config import get_settings


def main():
    settings = get_settings(profile="evaluation")
    container = ServiceContainer.get_service_container(settings)
    embedding_service = container.get_embedding_service()
    ingestion_service = container.get_ingestion_service() 
    data_manager = DataManager(settings.database_url, EmbeddingWorker(settings.database_url, embedding_service), ingestion_service)
   
    data_manager.cleanup()
    data_manager.populate()
    data_manager.embed_chunks(1000)
    # Run evaluation tests
    data_manager.cleanup()

if __name__ == "__main__":
    main()