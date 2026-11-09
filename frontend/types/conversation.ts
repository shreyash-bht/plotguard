/** Conversation contracts served by the Spring Boot core API (camelCase,
 * rooted at /api/conversations) plus the client-side display ref. */

/** Response entity of `POST /api/conversations`, `GET /api/conversations/{id}`,
 * and `PATCH /api/conversations/{id}`. */
export interface CoreConversation {
  conversationId: string;
  userId: string;
  contentId: string;
  /** Global spoiler boundary (story-order integer). */
  maxStoryOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** Element of `GET /api/conversations/{id}/messages` and the AI service's
 * persisted turns (which land in the same database table). */
export interface CoreMessage {
  messageId: string;
  conversationId: string;
  role: "user" | "assistant";
  /** For user turns: the raw question. For assistant turns: the answer. */
  originalContent: string;
  /** User turns only: the LLM-contextualized variant of the question. */
  contextualizedContent: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A conversation initiated by this client. The backend indexes conversations
 * by user; the local ref caches display metadata (titles, boundary labels)
 * that only exist client-side. */
export interface ConversationRef {
  conversation_id: string;
  content_id: string;
  max_story_order: number;
  /** Display title of the show, e.g. "Wednesday". */
  showTitle: string;
  /** Spoiler boundary label, e.g. "S1 · E4" or "E4". */
  boundaryLabel: string;
  /** Long form, e.g. "Season 1, Episode 4". */
  boundaryLongLabel: string;
  /** True when the boundary was raised mid-conversation (chat-side update). */
  boundaryChanged?: boolean;
  lastActiveAt: string;
}
