from langchain_google_genai import ChatGoogleGenerativeAI

from app.config import GEMINI_API_KEY, LLM_MODEL


class LLMService:
    def __init__(self):
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured")

        if not LLM_MODEL:
            raise ValueError("LLM_MODEL is not configured")

        self.llm = ChatGoogleGenerativeAI(
            model=LLM_MODEL,
            google_api_key=GEMINI_API_KEY,
            temperature=0.2
        )

    def answer(self, question: str, context: str) -> str:
        prompt = f"""
You are PlotGuard, a spoiler-safe anime question-answering friendly chatbot.
You will be provided limited context till which the viewer have made progress watching the anime. 
Rules:
- Do not use outside knowledge.
- Do not invent or assume facts that are not present in the context.
- Do not reveal information beyond the provided context.
- If the context does not contain enough information to answer the question,
  clearly say that there is not enough information available.
- Keep the answer concise and clear.

Context:
{context}

Question:
{question}

Answer:
"""
        response = self.llm.invoke(prompt)
        return response.content