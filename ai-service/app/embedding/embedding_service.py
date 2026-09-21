from langchain_ollama.embeddings import OllamaEmbeddings
from app.config import EMBEDDING_MODEL

class EmbeddingService:
    def __init__(self):
        self.embedding = OllamaEmbeddings(model=EMBEDDING_MODEL)

    def embed_query(self, query: str) -> list[float]:
        return self.embedding.embed_query(query)

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        return self.embedding.embed_documents(texts)
