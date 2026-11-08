import { aiApi } from "@/services/api-client";
import type {
  ChatRequest,
  ChatResponse,
  CreateConversationRequest,
  CreateConversationResponse,
} from "@/types/chat";

/**
 * POST /test/conversations — the only conversation-creation endpoint in the
 * current backend (its router documents that its core-service counterpart is
 * not implemented yet).
 */
export function createConversation(
  request: CreateConversationRequest,
  signal?: AbortSignal,
): Promise<CreateConversationResponse> {
  return aiApi.post<CreateConversationResponse>("/test/conversations", request, signal);
}

/**
 * POST /chat — synchronous (no streaming endpoint exists). History is fetched
 * server-side by conversation_id; `max_story_order` is the live spoiler
 * boundary applied to retrieval on every call.
 */
export function sendChatMessage(
  request: ChatRequest,
  signal?: AbortSignal,
): Promise<ChatResponse> {
  return aiApi.post<ChatResponse>("/chat", request, signal);
}
