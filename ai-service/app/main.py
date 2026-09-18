from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel

from app.embedding.scheduler import EmbeddingScheduler
from app.schema.story_unit_ingestion_request import StoryUnitIngestionRequest
from app.schema.story_unit_ingestion_response import StoryUnitIngestionResponse
from app.ingestion.ingestion_service import IngestinoService
from app.chunking.chunking_repository import ChunkingRepository
from app.retrieval.retrieval_service import RetrievalService
from app.embedding.embedding_service import EmbeddingService
from app.rag_service import RAGService
from app.schema.rag_request import RAGRequest
from app.schema.rag_response import RAGResponse

embedding_scheduler = EmbeddingScheduler()
ingestion_service = IngestinoService()
chunking_repository = ChunkingRepository()
retrieval_service = RetrievalService()
embedding_service = EmbeddingService()
rag_service = RAGService()

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

class ChunkRequest(BaseModel):
    content_id: str
    max_story_order: int
    query: str


@app.get("/api")
def hello():
    return "hello, world"


@app.post("/api/story-unit-data")
def ingest_episode_data(request: StoryUnitIngestionRequest) -> StoryUnitIngestionResponse:
    response = ingestion_service.ingest(request)
    return response


@app.get("/api/story-unit-data/{story_unit_id}")
def get_story_unit_data(story_unit_id: str):
    return chunking_repository.get_chunks(story_unit_id)


@app.post("/api/relevant-chunks")
def get_relevant_chunks(request: ChunkRequest):
    q_embedding = embedding_service.embed_query(request.query)
    return retrieval_service.retrieve(
        request.content_id, 
        request.max_story_order,
        q_embedding
    )


@app.post("/api/rag/answer", response_model=RAGResponse)
def answer(request: RAGRequest):
    response = rag_service.answer(
        content_id=request.content_id,
        max_story_order=request.max_story_order,
        question=request.question,
        top_k=5
    )
    return RAGResponse(answer=response[0]['text'])