from app.context.query_contextualizer import QueryContextualizer
from app.llm.llm_service import LLMService
from app.rag_service import RAGService
from app.chat.chat_repository import PostgresChatRepository, ChatMessage

class ChatbotService:
    def __init__(self, 
                query_contextualizer: QueryContextualizer,
                rag_service: RAGService,
                llm_service: LLMService,
                chat_repository: PostgresChatRepository):
        self.query_contextualizer = query_contextualizer
        self.rag_service = rag_service
        self.llm_service = llm_service
        self.chat_repository = chat_repository

    def format_history(self, chat_history: list[ChatMessage]) -> list[dict[str:str]]:
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
        top_k: int = 5
    ) -> str:
        chat_history = self.chat_repository.get_chat_history(conversation_id)
        formatted_chat_history = self.format_history(chat_history)
        print("formatted chat history is: ", formatted_chat_history)
        contextualised_user_question = self.query_contextualizer.contextualize(user_question, formatted_chat_history)
        # contextualised_user_question = user_question
        print("context added query: ", contextualised_user_question)
        relevant_facts = self.rag_service.fetch_relevant_chunks(
            content_id,
            max_story_order,
            contextualised_user_question,
            top_k
        )
        ai_response = self.llm_service.chat(contextualised_user_question, relevant_facts, formatted_chat_history)

        self.chat_repository.save_turn(conversation_id, user_question, contextualised_user_question, ai_response)

        return ai_response