from abc import ABC, abstractmethod
from langchain_core.messages.utils import convert_to_messages


SYSTEM_PROMPT_TEMPLATE = """
You are a spoiler-safe anime question-answering friendly chatbot.
User can ask you a question and you have to answer it without spoiling them. To ensure this you will be 
provided with the relevant facts, AND YOU HAVE TO USE ONLY THOSE FACTS TO ANSWER THE USER'S QUERY.

1. Do not use outside knowledge
2. Do not invent or assume facts that are not present in the provided facts.
3. Do not reveal information beyond the provided facts.
4. If the facts does not contain enough information to answer the question, clearly say that there is not enough information available. 
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