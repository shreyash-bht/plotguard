from contextlib import asynccontextmanager
from fastapi import FastAPI
import logging

from app.embedding.scheduler import EmbeddingScheduler
from app.routers import chat, story_unit_data, test
from app.container.service_container import ServiceContainer
from app.config.config import get_settings
from app.config.logging_config import configure_logging

configure_logging()
logger = logging.getLogger("ai-app")

settings = get_settings()
container = ServiceContainer.get_service_container(settings)

embedding_service = container.get_embedding_service()
embedding_scheduler = EmbeddingScheduler(settings.database_url, embedding_service, settings.embedding_interval_seconds)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global embedding_scheduler
    embedding_scheduler.start()
    logger.info("PlotGuard AI service started.")
    yield
    logger.info("PlotGuard AI service stopped.")


app = FastAPI(
    title="PlotGuard AI Service",
    lifespan=lifespan,
    root_path="/api/ai"
)


app.include_router(chat.router)
app.include_router(story_unit_data.router)
app.include_router(test.router)


@app.get("")
def hello():
    return "hello, world"
