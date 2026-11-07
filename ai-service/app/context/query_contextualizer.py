from pydantic import BaseModel, Field
from app.llm.chat_model import ChatModel


class ContextualizedQuery(BaseModel):
    query: str = Field(description="A standalone version of the user's latest question")
    was_contextualized: bool = Field(description="True if conversation history was required to rewrite the question")


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
- Prefer the most recent relevant topic.
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
User: Who is Ryan?

Latest question:
Where does he live?

Output:
Where does Ryan live?

---

Conversation:
User: Why did Eren want to join the Scouts?

Latest question:
Who is Lester?

Output:
Who is Lester?

The conversation history is only used to resolve references.
Do not use it to answer the question.

Conversation history:
{chat_history}

Latest user question:
{question}
"""


class QueryContextualizer():
    def __init__(self, chat_model: ChatModel):
        self._chat_model = chat_model
        self._structured_llm = self._chat_model.with_structured_output(ContextualizedQuery) 

    def contextualize(
        self,
        question: str,
        conversation_history: list[dict[str, str]],) -> str:
        history = self._format_history(conversation_history)

        prompt = SYSTEM_PROMPT.format(
            chat_history=history,
            question=question,
        )

        response = self._structured_llm.invoke(prompt)
        return response.query
    
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