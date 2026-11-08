/** A conversation initiated by this client. No backend endpoint serves a list
 * of conversations yet, so metadata lives in client storage. */
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
