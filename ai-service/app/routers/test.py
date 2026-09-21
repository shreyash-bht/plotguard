# apis to test and evaluate the model's accuracy and performance
# also includes apis that needs to be exposed by core service, but are not implemented yet


from fastapi import APIRouter


from app.container.service_container import ServiceContainer
from app.chat.chat_repository import PostgresChatRepository
from app.schema.conversations_request import ConversationRequest
from app.schema.conversations_response import ConversationResponse


router = APIRouter(prefix="/test")


container = ServiceContainer.get_service_container()
chat_repository: PostgresChatRepository = container.get_chat_repository()


@router.post("/conversations")
def create_conversation(request: ConversationRequest):
    response = chat_repository.create_conversation(request.user_id, request.content_id, request.max_story_order)
    return ConversationResponse(response.user_id, response.content_id, response.max_story_order, response.conversation_id)
