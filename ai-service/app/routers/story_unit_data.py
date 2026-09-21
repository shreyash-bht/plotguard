from fastapi import APIRouter
from app.container.service_container import ServiceContainer
from app.ingestion.ingestion_service import IngestionService
from app.chunking.chunking_repository import ChunkingRepository
from app.schema.story_unit_ingestion_request import StoryUnitIngestionRequest
from app.schema.story_unit_ingestion_response import StoryUnitIngestionResponse


container = ServiceContainer.get_service_container()
ingestion_service: IngestionService = container.get_ingestion_service()
chunking_repository = ChunkingRepository()


router = APIRouter(prefix="/story-unit-data")


@router.post("")
def ingest_episode_data(request: StoryUnitIngestionRequest) -> StoryUnitIngestionResponse:
    response = ingestion_service.ingest(request)
    return response


@router.get("/{story_unit_id}")
def get_episode_data(story_unit_id: str):
    return chunking_repository.get_chunks(story_unit_id)