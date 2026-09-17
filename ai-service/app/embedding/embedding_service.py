from langchain_ollama.embeddings import OllamaEmbeddings


class EmbeddingService:
    embedding = OllamaEmbeddings(model="qwen3-embedding:0.6B")

    def embed_query(self, query: str) -> list[float]:
        return self.embedding.embed_query(query)

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        return self.embedding.embed_documents(texts)

    