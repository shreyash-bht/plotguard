import threading
from app.embedding.embedding_service import EmbeddingService
from app.llm.llm_service import LLMService
from app.retrieval.retrieval_service import RetrievalService
from app.rag.rag_service import RAGService
from app.ingestion.ingestion_service import IngestionService
from app.chunking.chunking_repository import ChunkingRepository
from app.chunking.chunking_service import ChunkingService
from app.chat.chat_repository import PostgresChatRepository
from app.chat.chatbot_service import ChatbotService
from app.context.query_contextualizer import QueryContextualizer

class ServiceContainer:
    _instance = None
    _lock = threading.Lock()

    def __init__(self):
        if ServiceContainer._instance is not None:
            raise RuntimeError("Use ServiceContainer.get_service_container() instead")

        self.__embedding_service = EmbeddingService()
        self.__llm_service = LLMService()
        self.__retrieval_service = RetrievalService()
        self.__rag_service = RAGService(self.__embedding_service, self.__retrieval_service)
        self.__ingestion_service = IngestionService(ChunkingRepository(), ChunkingService())
        self.__chat_repository = PostgresChatRepository()
        self.__query_contextualizer = QueryContextualizer()
        self.__chatbot_service = ChatbotService(self.__query_contextualizer, self.__rag_service, self.__llm_service, self.__chat_repository)

    @classmethod
    def get_service_container(cls):
        if cls._instance == None:
            with cls._lock:
                if cls._instance is None:
                    instance = ServiceContainer()
                    cls._instance = instance
        return cls._instance

    def get_embedding_service(self):
        return self.__embedding_service

    def get_llm_service(self):
        return self.__llm_service

    def get_retrieval_service(self):
        return self.__retrieval_service

    def get_rag_service(self):
        return self.__rag_service

    def get_ingestion_service(self):
        return self.__ingestion_service

    def get_chat_repository(self):
        return self.__chat_repository    

    def get_chatbot_service(self):
        return self.__chatbot_service