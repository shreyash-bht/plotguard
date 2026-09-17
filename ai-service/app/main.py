from contextlib import asynccontextmanager
from pydantic import BaseModel, Field
from fastapi import FastAPI

from app.embedding.scheduler import EmbeddingScheduler
from app.schema.story_unit_ingestion_request import StoryUnitIngestionRequest
from app.schema.story_unit_ingestion_response import StoryUnitIngestionResponse
from app.ingestion.ingestion_service import IngestinoService
from app.chunking.chunking_repository import ChunkingRepository

embedding_scheduler = EmbeddingScheduler()
ingestion_service = IngestinoService()
chunking_repository = ChunkingRepository()

@asynccontextmanager
async def lifespan(app: FastAPI):
    global embedding_scheduler
    embedding_scheduler.start()
    print("PlotGuard AI service started.")
    yield
    print("PlotGuard AI service stopped.")

app = FastAPI(
    title="PlotGuard AI Service",
    lifespan=lifespan
)


@app.get("/")
def hello():
    return "hello, world"


@app.post("/story-unit-data")
def ingest_episode_data(request: StoryUnitIngestionRequest):
    response = ingestion_service.ingest(request)
    return response


@app.get("/story-unit-data/{story_unit_id}")
def get_story_unit_data(story_unit_id: str):
    return chunking_repository.get_chunks(story_unit_id)