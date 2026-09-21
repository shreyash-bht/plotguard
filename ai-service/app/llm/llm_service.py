from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages.utils import convert_to_messages
from app.config import GEMINI_API_KEY, LLM_MODEL


SYSTEM_PROMPT_TEMPLATE = """
You are a PlotGuard, a spoiler-safe anime question-answering friendly chatbot.
You will be provided limited context till which the viewer have made progress watching the anime.

1. Do not use outside knowledge
2. Do not invent or assume facts that are not present in the context.
3. Do not reveal information beyond the provided context.
4. If the context does not ccontain enough information to answer the question, clearly say that there is not enough information available. 
Keep the answer concise and clear.
Retrieved facts : {context}
"""

class LLMService:
    def __init__(self):
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured")

        if not LLM_MODEL:
            raise ValueError("LLM_MODEL is not configured")

        self.llm = ChatGoogleGenerativeAI(
            model=LLM_MODEL,
            google_api_key=GEMINI_API_KEY,
            max_tokens=2000
        )

        
    def chat(self, question: str, facts: str, chat_history: list[dict]) -> str:
        system_msg = ("system", SYSTEM_PROMPT_TEMPLATE.format(context=facts))
        history_msgs = convert_to_messages(chat_history)
        current_msg = ("human", question)
        messages = [system_msg, *history_msgs, current_msg]

        response = self.llm.invoke(messages)

        ai_response = response.content[0]['text']

        return ai_response