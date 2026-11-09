import { aiApi } from "@/services/api-client";
import type { ChatRequest, ChatResponse } from "@/types/chat";

/**
 * POST /chat — synchronous (no streaming endpoint exists). History is fetched
 * server-side by conversation_id (and turns are persisted there by the AI
 * service itself, so the client never writes messages); `max_story_order` is
 * the live spoiler boundary applied to retrieval on every call.
 */
export function sendChatMessage(
  request: ChatRequest,
  signal?: AbortSignal,
): Promise<ChatResponse> {
  return aiApi.post<ChatResponse>("/chat", request, signal);
}
