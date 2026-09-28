import psycopg
from evaluation import loader
from app.embedding.embedding_worker import EmbeddingWorker
from app.ingestion.ingestion_service import IngestionService
from app.schema.story_unit_ingestion_request import StoryUnitIngestionRequest


class DataManager:
    def __init__(self, DATABASE_URL: str, embeddding_wroker: EmbeddingWorker, ingestion_service: IngestionService):
        self._database_url = DATABASE_URL
        self._embedding_worker = embeddding_wroker
        self._ingestion_service = ingestion_service

    def populate(self):
         self._insert_contents_data()
         self._insert_seasons_data()
         self._insert_story_units_meta_data()
         self._insert_story_unit_data()

    def _insert_contents_data(self): 
        with psycopg.connect(self._database_url) as conn:
            with conn.cursor() as curr:
                query = "INSERT INTO contents(content_id, title, content_type) values (%s, %s, %s)"
                data = loader.get_contents_data()
                formatted_data = [(d.content_id, d.title, d.content_type) for d in data]
                curr.executemany(query, formatted_data,)

    def _insert_seasons_data(self):
        with psycopg.connect(self._database_url) as conn:
            with conn.cursor() as curr:
                query = "INSERT INTO seasons(season_id, content_id, season_number) values (%s, %s, %s)"
                data = loader.get_seasons_data()
                formatted_data = [(d.season_id, d.content_id, d.season_number) for d in data]
                curr.executemany(query, formatted_data,)

    def _insert_story_units_meta_data(self):
        with psycopg.connect(self._database_url) as conn:
            with conn.cursor() as curr:
                query = "INSERT INTO story_units(story_unit_id, content_id, season_id, unit_type, title, story_order)" \
                " values (%s, %s, %s, %s, %s, %s)"
                data = loader.get_story_units_data()
                formatted_data = [(d.story_unit_id, d.content_id, d.season_id, d.unit_type, d.title, d.story_order) for d in data]
                curr.executemany(query, formatted_data,)


    def cleanup(self):
         with psycopg.connect(self._database_url) as conn:
            with conn.cursor() as curr:
                curr.execute("DELETE FROM contents")        
                curr.execute("DELETE FROM seasons")
                curr.execute("DELETE FROM story_units")
                curr.execute("DELETE FROM knowledge_chunks")

    def _insert_story_unit_data(self):
        story_unit_data = loader.get_story_units_data()
        for data in story_unit_data:
            self._ingestion_service.ingest(StoryUnitIngestionRequest(content_id=data.content_id, story_unit_id=data.story_unit_id,
                                                                     story_unit_text=data.story_unit_text))

    def embed_chunks(self, batch_size):
        self._embedding_worker.process(batch_size)