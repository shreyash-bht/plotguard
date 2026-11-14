# Plotguard AI — Backend Integration Notes (Phase 1)

Facts verified directly from source code. The frontend must follow these contracts exactly.

## Backend topology

| Service | Stack | Default port | Route prefix | CORS |
|---|---|---|---|---|
| Core API (`api/`) | Spring Boot 4.1, Java 21 | 8080 (unset) | none | **None configured** |
| AI service (`ai-service/`) | FastAPI, port from Dockerfile | 8000 | `root_path="/api/ai"` | **No CORS middleware** |

> Because neither service sends CORS headers, the browser cannot call them cross-origin.
> The frontend proxies all calls through Next.js `rewrites`, making requests same-origin.
> `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_AI_API_BASE_URL` therefore default to the
> proxy paths (`/api/core`, `/api/ai`) but remain configurable for absolute URLs.

## Core API (Spring Boot, :8080)

### Auth
- `POST /auth/guest-register` — takes an empty/insignificant body.
  Returns the **serialized `User` entity** (camelCase keys, no token):
  ```json
  {
    "userId": "<uuid>", "username": "AzureRaven1234", "emailId": null,
    "passwordHash": null, "tempUser": true, "createdAt": "<iso-instant>",
    "lastLogin": null, "status": "active",
    "roles": [{ "role_id": 3, "roleName": "ROLE_USER", "description": "User" }]
  }
  ```
  - Username generated server-side (Adjective+Noun+1000–9999, e.g. "KitsuneRonin4321").
  - **No token is returned.** Temp users have no password, so JWT login is unavailable
    for them. JWTs expire after 15 min anyway (`security.jwt.expiration-time`).
  - **Authz reality:** `/auth/**` and `/api/**` are `permitAll()`; only `anyRequest()`
    (i.e. nothing else currently) requires auth. So the frontend sends no
    Authorization header today; guest identity = the client-side stored `userId`.
  - Login DTO uses snake_case: `{ "user_id": "<uuid>", "password": "..." }` →
    `{ "token_type": "Bearer", "access_token": "<jwt>" }`. Not usable for guests.

### Content / seasons / story units (all GET endpoints are public, no pagination)
- `GET /api/contents` → `Content[]`:
  `{ contentId, title, description, contentType: "ANIME" | "TV_SHOW" | "MOVIE", releaseDate: "yyyy-MM-dd", createdAt, updatedAt }`
  - ⚠️ **No poster/artwork field exists on `Content`.**
- `GET /api/contents/{contentId}` → single `Content` (entity-not-found surfaces as HTTP 500).
- `GET /api/contents/{contentId}/seasons` → `Season[]`:
  `{ seasonId, contentId, seasonNumber, title|null, description|null }`
- `GET /api/contents/{contentId}/story-units` → `StoryUnit[]`:
  `{ storyUnitId, contentId, seasonId|null, storyUnitType: "EPISODE"|"CHAPTER"|"OVA"|"MOVIE",
     unitNumber, title|null, description|null, storyOrder, releaseDate|null, createdAt, updatedAt }`
  - `storyOrder` is a **global, per-content ordering integer** (this is the spoiler-boundary unit).
  - `unitNumber` is per-season-like numbering (`unit_type` EPISODE etc.).
- Write endpoints (`POST /api/contents`, `.../seasons`, `.../story-units`,
  `POST /api/story-units/{id}/knowledge-chunks`) are ingest/admin surface — **not used by the frontend**.

### Errors
- No `@ControllerAdvice`, no standard error envelope. Not found → HTTP 500 with
  Spring's default body `{ timestamp, status: 500, error, path }`. Treat non-2xx as failure
  and surface a generic message.

### Conversations / messages (implemented; `ConversationApi` + `MessageApi`)
- `POST /api/conversations` request `{ user_id, content_id, max_story_order }` →
  serialized `Conversation` entity (**camelCase, DB-generated id**):
  `{ conversationId, userId, contentId, maxStoryOrder, createdAt, updatedAt }`
  - Validating: unknown user/content → 500 (EntityNotFoundException; no ControllerAdvice).
  - `conversation_id` must be omitted (rejected if supplied).
- `GET /api/conversations/user/{userId}` → `Conversation[]`, most recently
  `updatedAt` first (note: `updatedAt` only moves on a boundary PATCH — see gaps).
- `GET /api/conversations/{conversationId}` → single `Conversation`.
- `PATCH /api/conversations/{conversationId}` request `{ user_id, max_story_order }` →
  updated `Conversation`; ownership-checked by user.
- `GET /api/conversations/{conversationId}/messages?user_id={userId}` →
  `Message[]` chronological (`createdAt` asc), ownership-checked:
  `{ messageId, conversationId, role: "user"|"assistant", originalContent,
     contextualizedContent, createdAt, updatedAt }`.
- `POST .../messages` writes turns (role accepted so the AI service can persist
  assistant turns) — **not used by the frontend**, which only reads history.
  The frontend must NOT write turns: the AI service already persists both roles
  of each `/chat` exchange into the same shared `messages` table.

## AI service (FastAPI, :8000, root_path `/api/ai`)

- `POST /chat` → `{ "answer": "<markdown-ish LLM text>", "chat_metadata": <object|null> }`
  Request:
  ```json
  {
    "conversation_id": "<uuid>",
    "content_id": "<uuid>",
    "max_story_order": 12,
    "user_question": "Why did Eren do that?",
    "is_send_metadata": false,
    "enable_reranking": null
  }
  ```
  - **No streaming**: single synchronous JSON response (no SSE/chunked endpoints exist).
  - Chat history is fetched server-side from Postgres by `conversation_id` (last 10 turns).
    The client never sends history.
  - `max_story_order` is the live spoiler boundary used for retrieval per request
    (`story_order <= max_story_order` filter), regardless of the value stored on the
    conversation row — so **raising the boundary mid-conversation works per message**.
  - `chat_metadata` (`null` unless `is_send_metadata: true`) contains
    `contextualized_query`, `generation_time_seconds`, `token_usage`, `used_chunks[]`.
- `POST /test/conversations` → `{ conversation_id, user_id, content_id, max_story_order }`
  Request: `{ user_id, content_id, max_story_order }`.
  - **Deprecated for the frontend** — now creates conversations via the core API
    (`POST /api/core/conversations`, same shared database). The endpoint remains
    test/evaluation-only.
- `POST /story-unit-data` + `GET /story-unit-data/{id}` — knowledge ingestion (admin, not frontend).
- No auth checks of any kind.

## Gaps & frontend decisions

| Gap in backend | Frontend decision |
|---|---|
| No artwork/poster field on `Content` | Render generated placeholder artwork (title initial + deterministic gradient). Not fake data, just an image-less UI state. |
| Conversation metadata carries no display titles/labels on the server | Local display cache (per guest, in storage) holds `showTitle`/boundary labels; the conversation index itself is server-hydrated (`GET /api/conversations/user/{userId}`). |
| Sidebar conversations | Server list merged with the local display cache; titles for conversations created on other devices are fetched on demand (`GET /api/contents/{id}`). |
| Guest registration returns no usable token | Guest user (id + username) is persisted client-side and reused; no Authorization header is sent. |
| Conversations are now created via the core API | `POST /api/core/conversations` replaced the temporary AI-service `/test/conversations` workaround. |
| No streaming chat endpoint | Show an active "thinking" indicator; render the full answer when it arrives. |
| Errors = 500 with default Spring body | Global fetch wrapper normalizes errors into typed failures for UI. |
| `conversations.updated_at` only moves on boundary PATCH | Sidebar "recent" ordering reflects last boundary change, not last message, until the record's timestamp is bumped on activity. |
