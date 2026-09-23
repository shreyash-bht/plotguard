# PlotGuard

## Summary

PlotGuard is a spoiler-safe AI chatbot for anime.

It allows users to ask questions about an anime while restricting the AI's knowledge to the user's current viewing progress.

The project is built as a two-service application:

* **Spring Boot API** — handles the core application, users, anime data, episodes, authentication, and other backend functionality.
* **FastAPI AI Service** — handles query contextualisation, embeddings, retrieval, and LLM-based response generation.

PlotGuard uses a Retrieval-Augmented Generation (RAG) pipeline to retrieve relevant information from the anime's available content before generating a response.

A key part of the system is the **episode-level spoiler boundary**. Content from episodes beyond the user's viewing progress is excluded from retrieval.

## Use Case

A common problem with AI chatbots is that they know the entire story of an anime.

For example, if a user has only watched up to Episode 20, asking:

> "Why did this character do that?"

could result in an answer containing information from later episodes.

PlotGuard addresses this by associating knowledge with specific story units and enforcing the user's viewing boundary during retrieval.

Example:

```text
User has watched: Episode 20

Question:
"Why did Eren do that?"

        ↓

Query Contextualisation

        ↓

Retrieval
Only content from Episode 20 or earlier

        ↓

Relevant Context

        ↓

LLM

        ↓

Spoiler-safe answer
```

The system is also designed for multi-turn conversations, where users can ask follow-up questions such as:

```text
User: Who was Eren's father?

User: What about his mother?

User: Why did he do that?
```

The query contextualisation layer converts follow-up questions into standalone queries that can be used effectively for retrieval.

## Structure

The project is divided into two main services:

```text
PlotGuard
│
├── api/
│   └── Spring Boot
│       ├── Authentication
│       ├── Users
│       ├── Anime / Content
│       ├── Seasons
│       ├── Story Units
│       └── Core APIs
│
└── ai/
    └── FastAPI
        ├── Query Contextualisation
        ├── Embeddings
        ├── Vector Retrieval
        ├── RAG
        └── LLM Integration
```

### Core API

The Spring Boot service manages the application's core domain and APIs.

Technologies currently used include:

* Java
* Spring Boot
* Spring Data JPA
* Spring Security
* PostgreSQL
* Flyway
* JWT

### AI Service

The FastAPI service is responsible for AI-related operations.

The current pipeline is:

```text
User Query
    ↓
Query Contextualisation
    ↓
Embedding
    ↓
Vector Retrieval
    ↓
Relevant Knowledge
    ↓
LLM
    ↓
Response
```

The AI service is designed to work independently from the core Spring Boot application so that AI-related components can evolve separately.

### Knowledge Structure

Anime information is organised around story units such as episodes.

```text
Content
  └── Season
       └── Story Unit / Episode
            └── Knowledge Chunks
```

Knowledge chunks contain the information used for semantic retrieval.

Each chunk is associated with its corresponding story unit, allowing the retrieval layer to enforce the user's viewing boundary.

### Current Development

PlotGuard is currently under active development.

The architecture and retrieval pipeline are expected to evolve as additional retrieval, caching, evaluation, and AI capabilities are added.
