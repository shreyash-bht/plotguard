import os

from dotenv import load_dotenv

load_dotenv()


DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:admin@localhost:5432/postgres")

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL","qwen3-embedding:0.6B")
EMBEDDING_INTERVAL_SECONDS = int(os.getenv("EMBEDDING_INTERVAL_SECONDS", "30"))

GEMINI_LLM_MODEL = os.getenv("LLM_MODEL", "gemini-3.1-flash-lite")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

QWEN_LLM_MODEL = os.getenv("QWEN_LLM_MODEL", "qwen2.5:3b")