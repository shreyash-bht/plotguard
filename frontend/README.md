# PlotGuard — Frontend

Spoiler-aware AI chatbot for anime and TV shows. Pick a show, lock the episode
you've watched, and ask the AI anything — it will never reveal events beyond
your spoiler boundary.

## Stack

- Next.js 16 (App Router, Turbopack, React 19)
- TypeScript, Tailwind CSS 4
- zustand (session/conversation state), react-markdown + remark-gfm (answers), lucide-react (icons)

## Getting started

```bash
npm install
npm run dev # http://localhost:3000
```

Requires the two backend services to be running:

- **Core API** (Spring Boot) on `http://localhost:8080` — users, contents, seasons, story units
- **AI service** (FastAPI) on `http://localhost:8000` — conversations + chat (`root_path /api/ai`)

## Configuration

Copy/see `.env.local`:

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `/api/core` | Core API base URL used by the client |
| `NEXT_PUBLIC_AI_API_BASE_URL` | `/api/ai` | AI service base URL used by the client |
| `CORE_API_ORIGIN` | `http://localhost:8080` | Server-side rewrite target for the core API |
| `AI_API_ORIGIN` | `http://localhost:8000` | Server-side rewrite target for the AI service |

Neither backend sends CORS headers, so by default all client requests go through
same-origin proxy rewrites defined in `next.config.ts`:

- `/api/core/:path*` → `${CORE_API_ORIGIN}/api/:path*`
- `/api/ai/:path*` → `${AI_API_ORIGIN}/api/ai/:path*`

Set absolute `NEXT_PUBLIC_*` values (and matching CORS setup) to call the
services directly from the browser instead.

## Architecture

```
app/                      # /  · /select · /chat/[conversationId]
components/
  layout/                 # App shell, sidebar, settings, guest bootstrap
  dashboard/              # Hero section
  show/                   # Show grid (search, filters, states)
  episode/                # Episode selection + spoiler boundary flow
  chat/                   # Chat view, messages, composer, boundary modal
  ui/                     # Button, Modal, Badge, Skeleton, Spinner, artwork
services/                 # apiClient + auth/content/chat services (only place calling backends)
stores/                   # zustand: guest session, conversation index (persisted)
hooks/                    # useGuestSession
lib/                      # config, formatting, episode grouping helpers
types/                    # Exact backend DTO mirrors
docs/BACKEND_INTEGRATION.md  # Verified API contracts + known backend gaps
```

## Backend integration notes

Verified against source code; full detail in `docs/BACKEND_INTEGRATION.md`. Key
facts encoded by the frontend:

- `POST /auth/guest-register` returns the user entity only (no token; guest
  users have no password, and core content endpoints are public), so the guest
  user object is the client-side identity.
- `POST /test/conversations` (AI service) is the only endpoint that creates
  conversations today; `POST /chat` fetches history server-side by
  `conversation_id` and takes `max_story_order` — the spoiler boundary — per
  request.
- There is no endpoint to list conversations or fetch message history, so the
  sidebar conversation index lives in client storage (see doc for details).
