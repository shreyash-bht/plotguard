import logging
import time
from app.context.query_contextualizer import QueryContextualizer
from app.llm.chat_model import ChatModel
from app.rag.rag_service import RAGService
from app.chat.chat_repository import PostgresChatRepository, ChatMessage
from app.schema.chat_metadata import ChatMetadata

logger = logging.getLogger("ai-app.chatbot")

# Factual answers are capped hard: sharpness *is* the feature here.
FACTUAL_MAX_TOKENS = 300
# Social/meta answers; anything longer means the router got it wrong.
NONE_MAX_TOKENS = 150


class ChatbotService:
    def __init__(self, 
                query_contextualizer: QueryContextualizer,
                rag_service: RAGService,
                chat_model: ChatModel,
                chat_repository: PostgresChatRepository):
        self._query_contextualizer = query_contextualizer
        self._rag_service = rag_service
        self._chat_model = chat_model
        self._chat_repository = chat_repository

    def _format_history(self, chat_history: list[ChatMessage]) -> list[dict[str:str]]:
        formatted_chat_history = []
        for chat in chat_history:
            if chat.role == "user":
                formatted_chat_history.append({"role": chat.role, "content": chat.contextualized_content})
            elif chat.role == "assistant":
                formatted_chat_history.append({"role": chat.role, "content": chat.original_content})
        return formatted_chat_history

    def chat(
        self,
        conversation_id: str,
        content_id: str,
        max_story_order: int,
        user_question: str,
        is_send_metadata: bool,
        enable_reranking: bool,
        top_k: int = 5
    ) -> tuple[str, ChatMetadata | None]:
        chat_metadata = None
        start_time = time.perf_counter()

        chat_history = self._chat_repository.get_chat_history(conversation_id)
        formatted_chat_history = self._format_history(chat_history)
        routed = self._query_contextualizer.contextualize(user_question, formatted_chat_history)
        logger.info(
            "route: intent=%s confidence=%s scope=%s conversation_id=%s",
            routed.intent, routed.confidence, routed.episode_scope, conversation_id,
        )

        usage_metadata = None
        relevant_context = None
        if routed.intent == "NONE":
            # No facts retrieved means nothing can leak: plain friendly mode.
            ai_response, usage_metadata = self._chat_model.chat(
                user_question,
                "",
                formatted_chat_history,
                max_tokens=NONE_MAX_TOKENS,
                mode="none",
            )
        else:
            relevant_context = self._rag_service.retrieve_context(
                content_id,
                max_story_order,
                routed,
                enable_reranking,
                top_k
            )
            logger.info(
                "retrieval: intent=%s chunks=%d context_chars=%d",
                routed.intent, len(relevant_context.retrieved_chunks), len(relevant_context.context),
            )
            ai_response, usage_metadata = self._chat_model.chat(
                routed.query,
                relevant_context.context,
                formatted_chat_history,
                max_tokens=FACTUAL_MAX_TOKENS if routed.intent == "FACTUAL" else None,
                mode="factual" if routed.intent == "FACTUAL" else "standard",
            )

        self._chat_repository.save_turn(conversation_id, user_question, routed.query, ai_response)
        elapsed_time = time.perf_counter() - start_time
        logger.debug(f"Time required to process the request : {elapsed_time}")
        if is_send_metadata:
            chat_metadata = ChatMetadata(contextualized_query=routed.query, 
                                        generation_time_seconds=elapsed_time, 
                                        token_usage=usage_metadata, 
                                        used_chunks=relevant_context.retrieved_chunks if relevant_context else [])
        return ai_response, chat_metadata