from app.context.query_contextualizer import QueryContextualizer
from app.llm.llm_service import LLMService
from app.rag_service import RAGService
from app.chat.chat_loader import PostgresChatLoader

class ChatbotService:
    def __init__(self, 
                query_contextualizer: QueryContextualizer,
                rag_service: RAGService,
                llm_service: LLMService,
                chat_loader: PostgresChatLoader):
        self.query_contextualizer = query_contextualizer
        self.rag_service = rag_service
        self.llm_service = llm_service
        self.chat_loader = chat_loader

    def chat(
        self,
        conversation_id: str,
        content_id: str,
        max_story_order: int,
        user_question: str,
        top_k: int = 5
    ) -> str:
        chat_history = self.chat_loader.get_chat_history(conversation_id)
        contextualised_user_question = self.query_contextualizer.contextualize(user_question, chat_history)
        # contextualised_user_question = user_question
        print("context added query: ", contextualised_user_question)
        relevant_facts = self.rag_service.fetch_relevant_chunks(
            content_id,
            max_story_order,
            contextualised_user_question,
            top_k
        )
        ai_response = self.llm_service.chat(contextualised_user_question, relevant_facts, chat_history)

        self.chat_loader.save_turn(conversation_id, contextualised_user_question, ai_response)

        return ai_response