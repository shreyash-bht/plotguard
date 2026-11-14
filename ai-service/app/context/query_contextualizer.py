from app.llm.chat_model import ChatModel
from app.schema.routed_query import RoutedQuery, parse_episode_scope

import logging

logger = logging.getLogger("ai-app.context")


SYSTEM_PROMPT = """
You are a query router for an anime/show question-answering system with an
episode-level spoiler boundary.

Three jobs, in order:
1) Rewrite the user's latest question into a standalone question that can be
   understood without the conversation history.
2) Route it for retrieval. Set:
   - intent:
     * FACTUAL — asks for a brief, retrievable fact (a name, a place, a
       relationship, "who did X", "when did Y happen"). Worth at most one or
       two lines of text.
     * SUMMARY — explicitly asks to recap/summarize ("what happened in
       season 1", "summarize episodes 1-10", "recap so far").
     * LENGTHY — needs a substantive multi-part answer (motivations,
       scene-by-scene recounting, analysis, connections across) and is NOT an
       explicit summary.
     * NONE — social or meta content ("hi", "thanks", "who are you?"),
       nothing about any show's story.
   - confidence: how sure you are about the intent (high / medium / low).
   - episode_scope: if the question explicitly names an episode range
     ("episodes 1-30", "first 12 episodes", "episode 4 to 8"), output it as
     "a-b"; otherwise null.

IMPORTANT rewrite rules:
- Do NOT answer the question.
- Do NOT add facts. Do NOT infer facts not present in the conversation.
- Preserve the user's original intent.
- Prefer the most recent relevant topic.
- Resolve pronouns and ambiguous references using the conversation.
- If the question is already standalone, keep it essentially unchanged.

Examples:

Conversation:
User: Why did Eren want to join the Scouts?
Assistant: He wanted to see the outside world.

Latest question:
What about his mother?

Output:
query: What did Eren's mother think about Eren joining the Scouts?
was_contextualized: true
intent: LENGTHY
confidence: high
episode_scope: null

---

Conversation:
User: Who is Ryan?

Latest question:
Where does he live?

Output:
query: Where does Ryan live?
was_contextualized: true
intent: FACTUAL
confidence: high
episode_scope: null

---

Latest question:
Summarize the first 30 episodes

Output:
query: Summarize the first 30 episodes
was_contextualized: false
intent: SUMMARY
confidence: high
episode_scope: 1-30

---

Latest question:
Thanks, that was helpful!

Output:
query: Thanks, that was helpful!
was_contextualized: false
intent: NONE
confidence: high
episode_scope: null

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
        self._router_llm = self._chat_model.with_structured_output(RoutedQuery)

    def contextualize(
        self,
        question: str,
        conversation_history: list[dict[str, str]],
    ) -> RoutedQuery:
        history = self._format_history(conversation_history)

        prompt = SYSTEM_PROMPT.format(
            chat_history=history,
            question=question,
        )

        try:
            routed = self._router_llm.invoke(prompt)
        except Exception:
            # Malformed/failed structured output must never fail the chat:
            # fall back to today's safest behavior (full retrieval).
            logger.exception("router structured output failed; falling back to LENGTHY")
            return RoutedQuery(
                query=question,
                was_contextualized=False,
                intent="LENGTHY",
                confidence="low",
                episode_scope=parse_episode_scope(question),
            )

        if not routed.episode_scope:
            parsed = parse_episode_scope(question)
            if parsed:
                routed.episode_scope = parsed

        logger.info(
            "routed question: intent=%s confidence=%s scope=%s contextualized=%s",
            routed.intent,
            routed.confidence,
            routed.episode_scope,
            routed.was_contextualized,
        )
        return routed

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