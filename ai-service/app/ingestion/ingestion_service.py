from app.schema.story_unit_ingestion_request import StoryUnitIngestionRequest
from app.schema.story_unit_ingestion_response import StoryUnitIngestionResponse

from app.chunking.chunking_repository import ChunkingRepository
from app.chunking.chunking_service import ChunkingService

class IngestionService:
    def __init__(self, chunking_repository: ChunkingRepository, chunking_service: ChunkingService):
        self.__chunking_repository = chunking_repository
        self.__chunking_service = chunking_service
        
    def ingest(self, story_unit_data: StoryUnitIngestionRequest) -> StoryUnitIngestionResponse:
        splitted_chunks = self.__chunking_service.split(story_unit_data.story_unit_text)
        number_of_ingested_chunks = self.__chunking_repository.save_chunks(story_unit_data.story_unit_id, splitted_chunks)
        response = StoryUnitIngestionResponse(content_id=story_unit_data.content_id, story_unit_id=story_unit_data.story_unit_id,
                                 chunks_created=number_of_ingested_chunks, embedding_status="DONE")
        return response