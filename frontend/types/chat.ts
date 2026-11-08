/** Exact AI-service chat contracts (FastAPI, root_path /api/ai). */

/** Request body of `POST /test/conversations`. */
export interface CreateConversationRequest {
  user_id: string;
  content_id: string;
  max_story_order: number;
}

/** Response of `POST /test/conversations`. */
export interface CreateConversationResponse {
  user_id: string;
  content_id: string;
  max_story_order: number;
  conversation_id: string;
}

/** Request body of `POST /chat`. */
export interface ChatRequest {
  conversation_id: string;
  content_id: string;
  max_story_order: number;
  user_question: string;
  is_send_metadata?: boolean;
  /** `null`/omitted means "use the service's configured default". */
  enable_reranking?: boolean | null;
}

export interface RetrievedChunk {
  chunk_id: string;
  chunk_index: number;
  chunk_text: string;
  story_order: number;
  distance: number;
  rerank_score: number | null;
}

export interface ChatMetadata {
  contextualized_query: string;
  generation_time_seconds: number;
  token_usage: unknown;
  used_chunks: RetrievedChunk[];
}

/** Response of `POST /chat`. `answer` is LLM text (not streamed). */
export interface ChatResponse {
  answer: string;
  chat_metadata: ChatMetadata | null;
}
