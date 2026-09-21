from pydantic import BaseModel, Field
from langchain_ollama import ChatOllama

from app.config import OLLAMA_BASE_URL


class ContextualizedQuery(BaseModel):
    query: str = Field(
        description="A standalone version of the user's latest question"
    )
    was_contextualized: bool = Field(
        description="True if conversation history was required to rewrite the question"
    )


SYSTEM_PROMPT = """
You are a query contextualizer for an anime question-answering system.

Your ONLY task is to rewrite the user's latest question into a
standalone question that can be understood without the conversation history.

IMPORTANT:
- Do NOT answer the question.
- Do NOT provide explanations.
- Do NOT add facts.
- Do NOT infer facts that are not present in the conversation.
- Preserve the user's original intent.
- Resolve pronouns and ambiguous references using the conversation.
- If the question is already standalone, keep it essentially unchanged.
- The output must be suitable for semantic vector retrieval.

Examples:

Conversation:
User: Why did Eren want to join the Scouts?
Assistant: He wanted to see the outside world.

Latest question:
What about his mother?

Output:
What did Eren's mother think about Eren joining the Scouts?

---

Conversation:
User: Who is Mikasa?

Latest question:
Where does she live?

Output:
Where does Mikasa live?

---

Conversation:
User: Why did Eren want to join the Scouts?

Latest question:
Who is Levi?

Output:
Who is Levi?

The conversation history is only used to resolve references.
Do not use it to answer the question.

Conversation history:
{chat_history}

Latest user question:
{question}
"""


class QueryContextualizer:

    def __init__(self):
        self.llm = ChatOllama(
            model="qwen2.5:1.5b",
            base_url=OLLAMA_BASE_URL,
            temperature=0,
        )

        self.structured_llm = self.llm.with_structured_output(
            ContextualizedQuery
        )

    def contextualize(
        self,
        question: str,
        conversation_history: list[dict[str, str]],
    ) -> ContextualizedQuery:

        history = self._format_history(conversation_history)

        prompt = SYSTEM_PROMPT.format(
            chat_history=history,
            question=question,
        )

        return self.structured_llm.invoke(prompt).query

    def _format_history(
        self,
        conversation_history: list[dict[str, str]],
    ) -> str:

        if not conversation_history:
            return "(No previous conversation)"

        return "\n".join(
            f"{message['role'].capitalize()}: {message['content']}"
            for message in conversation_history
        )