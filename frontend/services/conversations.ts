import { coreApi } from "@/services/api-client";
import { getContent, listSeasons, listStoryUnits } from "@/services/content";
import {
  episodeLongLabel,
  episodeShortLabel,
} from "@/lib/episodes";
import { getConversationRef, useConversationStore } from "@/stores/conversations";
import type {
  ConversationRef,
  CoreConversation,
  CoreMessage,
} from "@/types/conversation";

/** Request body of `POST /api/conversations`. */
export interface NewConversationRequest {
  user_id: string;
  content_id: string;
  max_story_order: number;
}

/** Request body of `PATCH /api/conversations/{id}` (boundary update). */
export interface UpdateConversationRequest {
  user_id: string;
  max_story_order: number;
}

/** POST /api/conversations — creates the durable conversation record. This
 * replaces the temporary AI-service `/test/conversations` workaround. */
export function createConversation(
  request: NewConversationRequest,
  signal?: AbortSignal,
): Promise<CoreConversation> {
  return coreApi.post<CoreConversation>("/conversations", request, signal);
}

/** GET /api/conversations/{id} */
export function getCoreConversation(
  conversationId: string,
  signal?: AbortSignal,
): Promise<CoreConversation> {
  return coreApi.get<CoreConversation>(`/conversations/${conversationId}`, signal);
}

/** GET /api/conversations/user/{userId} — most recently active first. */
export function listConversations(
  userId: string,
  signal?: AbortSignal,
): Promise<CoreConversation[]> {
  return coreApi.get<CoreConversation[]>(`/conversations/user/${userId}`, signal);
}

/** GET /api/conversations/{id}/messages?user_id={userId} — chronological
 * transcript, 404-style mismatches surface as generic ApiError (no
 * ControllerAdvice on the core API). */
export function fetchConversationMessages(
  conversationId: string,
  userId: string,
  signal?: AbortSignal,
): Promise<CoreMessage[]> {
  return coreApi.get<CoreMessage[]>(
    `/conversations/${conversationId}/messages?user_id=${encodeURIComponent(userId)}`,
    signal,
  );
}

/** PATCH /api/conversations/{id} — persists a spoiler-boundary change. The
 * per-request `max_story_order` sent to the AI keeps chat correct regardless,
 * so callers may treat a failure here as non-fatal (consistency-only). */
export function patchConversationBoundary(
  conversationId: string,
  request: UpdateConversationRequest,
  signal?: AbortSignal,
): Promise<CoreConversation> {
  return coreApi.patch<CoreConversation>(
    `/conversations/${conversationId}`,
    request,
    signal,
  );
}

/** Title cache for display-only lookups (sidebar). */
const titleCache = new Map<string, string>();

/** GET /api/contents/{contentId}, reduced to the show title; cached. */
export async function fetchShowTitle(
  contentId: string,
  signal?: AbortSignal,
): Promise<string> {
  const cached = titleCache.get(contentId);
  if (cached !== undefined) return cached;
  const content = await getContent(contentId, signal);
  titleCache.set(contentId, content.title);
  return content.title;
}

/**
 * Guarantees a local {@link ConversationRef} for a conversation that exists on
 * the server (e.g. created on another device): fetches the conversation, the
 * show title and its story units, rebuilds the boundary labels, and caches
 * the ref in the local store. Returns the known ref untouched otherwise.
 */
export async function ensureConversationRef(
  conversationId: string,
  signal?: AbortSignal,
): Promise<ConversationRef> {
  const existing = getConversationRef(conversationId);
  if (existing) return existing;

  const conversation = await getCoreConversation(conversationId, signal);
  const title = await fetchShowTitle(conversation.contentId, signal);

  let boundaryLabel = `Order ${conversation.maxStoryOrder}`;
  let boundaryLongLabel = `Story point ${conversation.maxStoryOrder}`;
  try {
    const [units, seasons] = await Promise.all([
      listStoryUnits(conversation.contentId, signal),
      listSeasons(conversation.contentId, signal).catch(() => []),
    ]);
    const unit = units.find(
      (u) => (u.storyOrder ?? u.unitNumber) === conversation.maxStoryOrder,
    );
    if (unit) {
      const season = unit.seasonId
        ? seasons.find((s) => s.seasonId === unit.seasonId) ?? null
        : null;
      boundaryLabel = episodeShortLabel(unit, season);
      boundaryLongLabel = episodeLongLabel(unit, season);
    }
  } catch (error) {
    if (signal?.aborted) throw error;
    // Fall back to the generic story-order labels above.
  }

  const ref: ConversationRef = {
    conversation_id: conversation.conversationId,
    content_id: conversation.contentId,
    max_story_order: conversation.maxStoryOrder,
    showTitle: title,
    boundaryLabel,
    boundaryLongLabel,
    lastActiveAt: conversation.updatedAt,
  };
  useConversationStore.getState().save(ref);
  return ref;
}
