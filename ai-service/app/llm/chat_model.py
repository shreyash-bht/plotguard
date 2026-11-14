from abc import ABC, abstractmethod
from langchain_core.messages import UsageMetadata
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
5. Only Answer the latest query asked by the user (Directly answer no need to mention you are using provided facts only). 
Retrieved facts : {context}
"""

FACTUAL_SYSTEM_PROMPT_TEMPLATE = """
You are a spoiler-safe anime question-answering chatbot.
Answer ONLY the specific fact the user asked for, using ONLY the retrieved facts.

1. Do not use outside knowledge.
2. Do not invent or assume facts that are not present in the provided facts.
3. If the retrieved facts do not contain the answer, say: "I don't have enough information from the episodes watched so far."
4. Keep the answer minimal: 1-2 sentences. No elaboration, no commentary, no follow-up questions.
Retrieved facts : {context}
"""

# No retrieval happens for this mode, so facts stay empty and nothing can leak.
NO_RAG_SYSTEM_PROMPT_TEMPLATE = """
You are PlotGuard, a friendly assistant inside a spoiler-safe anime and show
question-answering app.
The user's message needs no plot knowledge. Reply briefly and warmly.
If the user asks something about a show's story, invite them to ask it and
mention you can answer safely up to the episode they've watched.
"""


class ChatModel(ABC):
    def __init__(self):
        pass

    def chat(
        self,
        question: str,
        facts: str,
        chat_history: list[dict],
        max_tokens: int | None = None,
        mode: str = "standard",
    ) -> tuple[str, UsageMetadata]:
        template = self._prompt_template(mode)
        system_msg = ("system", template.format(context=facts))
        history_msgs = convert_to_messages(chat_history)
        current_msg = ("human", question)
        messages = [system_msg, *history_msgs, current_msg]
        return self.ask_llm(messages, max_tokens)

    @staticmethod
    def _prompt_template(mode: str) -> str:
        if mode == "factual":
            return FACTUAL_SYSTEM_PROMPT_TEMPLATE
        if mode == "none":
            return NO_RAG_SYSTEM_PROMPT_TEMPLATE
        return SYSTEM_PROMPT_TEMPLATE

    @abstractmethod
    def ask_llm(self, messages, max_tokens: int | None = None) -> tuple[str, UsageMetadata]:
        pass

    @abstractmethod
    def with_structured_output(self, prompt, output_schema):
        pass