from fastapi import APIRouter

from app.container.service_container import ServiceContainer
from app.chat.chatbot_service import ChatbotService
from app.schema.chat_request import ChatRequest
from app.schema.chat_response import ChatResponse


container = ServiceContainer.get_service_container()
chatbot_service: ChatbotService = container.get_chatbot_service()

router = APIRouter(prefix="/chat")

@router.post("")
def chat(request: ChatRequest) -> ChatResponse:
    response = chatbot_service.chat(
        request.conversation_id,
        request.content_id,
        request.max_story_order,
        request.user_question
    )

    return ChatResponse(answer=response)