from langchain_ollama.embeddings import OllamaEmbeddings

class EmbeddingService:
    def __init__(self, embedding_model: str):
        self.embedding = OllamaEmbeddings(model=embedding_model)

    def embed_query(self, query: str) -> list[float]:
        return self.embedding.embed_query(query)

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        return self.embedding.embed_documents(texts)
