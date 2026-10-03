import logging
from apscheduler.schedulers.background import BackgroundScheduler

from app.embedding.embedding_worker import EmbeddingWorker
from app.embedding.embedding_service import EmbeddingService


logger = logging.getLogger("ai-app.embedding_worker")


class EmbeddingScheduler:
    def __init__(self, database_string: str, embedding_service: EmbeddingService, embedding_interval_seconds):
        self.scheduler = BackgroundScheduler()
        self.worker = EmbeddingWorker(database_string, embedding_service)
        self._embedding_interval_seconds = embedding_interval_seconds

    def start(self):
        self.scheduler.add_job(
            self.worker.process,
            trigger="interval",
            seconds=self._embedding_interval_seconds,
            id="embedding_job",
            max_instances=1,
            coalesce=True
        )
        logger.info("Embedding scheduler started.")
        self.scheduler.start()

    def shutdown(self):
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Embedding scheduler stopped.")
