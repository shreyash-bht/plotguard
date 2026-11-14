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
        response = StoryUnitIngestionResponse(
            content_id=story_unit_data.content_id,
            story_unit_id=story_unit_data.story_unit_id,
            chunks_created=number_of_ingested_chunks,
            embedding_status=self.__actual_embedding_status(story_unit_data.story_unit_id, number_of_ingested_chunks),
        )
        return response

    def __actual_embedding_status(self, story_unit_id: str, chunks_created: int) -> str:
        """Truthful status instead of a hardcoded one: freshly inserted chunks
        are PENDING until the embedding worker processes them; a re-ingest of
        fully-completed text reports COMPLETED."""
        if chunks_created == 0:
            return "EMPTY"
        statuses = set(self.__chunking_repository.get_chunk_statuses(story_unit_id))
        if statuses == {"COMPLETED"}:
            return "COMPLETED"
        return "PENDING"
