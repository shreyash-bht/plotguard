from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel

from app.embedding.scheduler import EmbeddingScheduler
from app.schema.story_unit_ingestion_request import StoryUnitIngestionRequest
from app.schema.story_unit_ingestion_response import StoryUnitIngestionResponse
from app.chunking.chunking_repository import ChunkingRepository
from app.retrieval.retrieval_service import RetrievalService
from app.embedding.embedding_service import EmbeddingService
from app.rag_service import RAGService
from app.schema.chat_request import ChatRequest
from app.schema.chat_response import ChatResponse
from app.schema.conversations_request import ConversationRequest
from app.schema.conversations_response import ConversationResponse


from app.container.service_container import ServiceContainer

container = ServiceContainer.get_service_container()

embedding_scheduler = EmbeddingScheduler()
ingestion_service = container.get_ingestion_service()
chunking_repository = ChunkingRepository()
retrieval_service = container.get_retrieval_service()
embedding_service = container.get_embedding_service()
chat_loader = container.get_chat_loader()

chatbot_service = container.get_chatbot_service()


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


@app.post("/api/conversations")
def create_conversation(request: ConversationRequest):
    response = chat_loader.create_conversation(request.user_id, request.content_id, request.max_story_order)
    return response


@app.post("/api/chat")
def chat(request: ChatRequest):
    response = chatbot_service.chat(
        request.conversation_id,
        request.content_id,
        request.max_story_order,
        request.user_question
    )

    return ChatResponse(answer=response)