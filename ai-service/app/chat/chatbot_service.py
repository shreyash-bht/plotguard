import logging
import time
from app.context.query_contextualizer import QueryContextualizer
from app.llm.chat_model import ChatModel
from app.rag.rag_service import RAGService
from app.chat.chat_repository import PostgresChatRepository, ChatMessage
from app.schema.chat_metadata import ChatMetadata

logger = logging.getLogger("ai-app.chatbot")


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
        top_k: int = 5
    ) -> tuple[str, ChatMetadata | None]:
        chat_metadata = None
        start_time = time.perf_counter()
        chat_history = self._chat_repository.get_chat_history(conversation_id)
        formatted_chat_history = self._format_history(chat_history)
        contextualised_user_question = self._query_contextualizer.contextualize(user_question, formatted_chat_history)
        logger.info(f"context added query : {contextualised_user_question}")
        relevant_context = self._rag_service.retrieve_context(
            content_id,
            max_story_order,
            contextualised_user_question,
            top_k
        )
        ai_response = self._chat_model.chat(contextualised_user_question, relevant_context.context, formatted_chat_history)

        self._chat_repository.save_turn(conversation_id, user_question, contextualised_user_question, ai_response)
        elapsed_time = time.perf_counter() - start_time
        logger.debug(f"Time required to process the request : {elapsed_time}")
        if is_send_metadata:
            chat_metadata = ChatMetadata(used_chunks=relevant_context.retrieved_chunks,
                                        generation_time_seconds=elapsed_time,
                                        contextualized_query=contextualised_user_question)
        return ai_response, chat_metadata