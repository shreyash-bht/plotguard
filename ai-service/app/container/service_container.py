import threading
from app.embedding.embedding_service import EmbeddingService
from app.llm.gemini_chat_model import GeminiChatModel
from app.llm.ollama_chat_model import OllamaChatModel
from app.retrieval.retrieval_service import RetrievalService
from app.retrieval.reranker import ChunkReranker
from app.rag.rag_service import RAGService
from app.ingestion.ingestion_service import IngestionService
from app.chunking.chunking_repository import ChunkingRepository
from app.chunking.chunking_service import ChunkingService
from app.chat.chat_repository import PostgresChatRepository
from app.chat.chatbot_service import ChatbotService
from app.context.query_contextualizer import QueryContextualizer
from app.config.config import Settings

class ServiceContainer:
    _instance = None
    _lock = threading.Lock()

    def __init__(self, settings: Settings):
        if ServiceContainer._instance is not None:
            raise RuntimeError("Use ServiceContainer.get_service_container() instead")

        self._embedding_service = EmbeddingService(settings.embedding_model)
        self._chat_model = self._create_chat_model(settings)
        self._chunk_reranker = ChunkReranker()
        self._retrieval_service = RetrievalService(settings.database_url, self._chunk_reranker)
        self._rag_service = RAGService(self._embedding_service, self._retrieval_service)
        self._ingestion_service = IngestionService(ChunkingRepository(settings.database_url), ChunkingService())
        self._chat_repository = PostgresChatRepository(settings.database_url)
        self._query_contextualizer = QueryContextualizer(self._create_contextualizer_model(settings))
        self._chatbot_service = ChatbotService(self._query_contextualizer, self._rag_service, self._chat_model, self._chat_repository)

    @classmethod
    def get_service_container(cls, settings: Settings):
        if cls._instance == None:
            with cls._lock:
                if cls._instance is None:
                    instance = ServiceContainer(settings)
                    cls._instance = instance
        return cls._instance

    def get_embedding_service(self):
        return self._embedding_service

    def get_chat_model(self):
        return self._chat_model

    def get_retrieval_service(self):
        return self._retrieval_service

    def get_rag_service(self):
        return self._rag_service

    def get_ingestion_service(self):
        return self._ingestion_service

    def get_chat_repository(self):
        return self._chat_repository

    def get_chatbot_service(self):
        return self._chatbot_service

    def _create_chat_model(self, settings: Settings):
        chat_llm_config = settings.chat_llm
        if chat_llm_config["provider"] == "gemini":
            return GeminiChatModel(chat_llm_config["gemini"]["model"], chat_llm_config["gemini"]["api_key"])
        else:
            return OllamaChatModel(chat_llm_config["ollama"]["model"])

    def _create_contextualizer_model(self, settings: Settings):
        contextualizer_config = settings.contextualizer
        if contextualizer_config["provider"] == "gemini":
            return GeminiChatModel(contextualizer_config["gemini"]["model"], contextualizer_config["gemini"]["api_key"])
        else:
            return OllamaChatModel(contextualizer_config["ollama"]["model"])