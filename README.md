# PlotGuard

Spoiler-safe AI chatbot for anime and TV shows. Ask questions about a show, and the AI will only ever know what you've watched up to.

## Why

An AI trained on a show's full story will happily spoil you. PlotGuard ties every piece of knowledge to the episode it belongs to and uses your **viewing progress** as a hard boundary at retrieval time — answering questions only from episodes you've finished.

## How it works

```text
Question ("Why did Eren do that?")
    ↓
Query contextualisation          ← follow-ups ("What about his mother?") are
    ↓                              rewritten into standalone queries
Embedding + vector retrieval     ← only story units you've watched reach
    ↓                              the context window
LLM → spoiler-safe answer
```

## Services

| Module | Stack | Port | Role |
|---|---|---|---|
| `frontend/` | Next.js (React, TypeScript) | 3000 | Chat UI, guest sessions, spoiler-boundary picker; proxies both backends |
| `api/` | Spring Boot (Java, JPA, Flyway, JWT) | 8080 | Users, auth, content/seasons/episodes, conversations + messages |
| `ai-service/` | FastAPI (LangChain, PostgreSQL/pgvector) | 8000 | RAG pipeline: contextualisation, embeddings, retrieval, LLM |

Both backend services share a PostgreSQL database. The AI service persists every turn (question + answer) to the same `messages` table the core API reads, so chat history survives refreshes and devices.

## Knowledge structure

```text
Content (show)
  └── Season
       └── Story Unit / Episode     ← spoiler boundary unit
            └── Knowledge Chunks    ← text used for semantic retrieval
```

Each chunk is tagged with its story unit's global story order, which lets retrieval enforce the user's boundary per question.

## Running locally

Requirements: PostgreSQL, Java 21, Python 3.12 (or Docker), Node.js, an Ollama host for embeddings, and a Gemini API key for the AI service.

```bash
# 1. Core API (Flyway migrates the schema on boot)
cd api && ./gradlew bootRun

# 2. AI service (configure config/local.yaml + .env first)
cd ai-service && pip install -r requirements.txt
uvicorn app.main:app --port 8000

# 3. Frontend
cd frontend && npm install && npm run dev   # → http://localhost:3000
```

## Status

Under active development. The retrieval pipeline, evaluation, and AI capabilities are still evolving.
