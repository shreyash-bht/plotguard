from abc import ABC, abstractmethod
from langchain_core.messages.utils import convert_to_messages


SYSTEM_PROMPT_TEMPLATE = """
You are a PlotGuard, a spoiler-safe anime question-answering friendly chatbot.
You will be provided limited context till which the viewer have made progress watching the anime.

1. Do not use outside knowledge
2. Do not invent or assume facts that are not present in the context.
3. Do not reveal information beyond the provided context.
4. If the context does not ccontain enough information to answer the question, clearly say that there is not enough information available. 
Keep the answer concise and clear.
5. Only Answer the latest query asked by the user. 
Retrieved facts : {context}
"""


class ChatModel(ABC):
    def __init__(self):
        pass

    def chat(self, question: str, facts: str, chat_history: list[dict]) -> str:
        system_msg = ("system", SYSTEM_PROMPT_TEMPLATE.format(context=facts))
        history_msgs = convert_to_messages(chat_history)
        current_msg = ("human", question)
        messages = [system_msg, *history_msgs, current_msg]

        ai_response = self.ask_llm(messages)

        return ai_response

    @abstractmethod
    def ask_llm(self, messages) -> str:
        pass

    @abstractmethod
    def with_structured_output(self, prompt, output_schema):
        pass