from apscheduler.schedulers.background import BackgroundScheduler

from app.config.config import EMBEDDING_INTERVAL_SECONDS
from app.embedding.embedding_worker import EmbeddingWorker


class EmbeddingScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.worker = EmbeddingWorker()

    def start(self):
        self.scheduler.add_job(
            self.worker.process,
            trigger="interval",
            seconds=EMBEDDING_INTERVAL_SECONDS,
            id="embedding_job",
            max_instances=1,
            coalesce=True
        )
        print("Embedding scheduler started.")
        self.scheduler.start()

    def shutdown(self):
        if self.scheduler.running:
            self.scheduler.shutdown()
            print("Embedding scheduler stopped.")
