from langchain_ollama import ChatOllama
from langchain_core.messages import UsageMetadata
from app.llm.chat_model import ChatModel


class OllamaChatModel(ChatModel):
    def __init__(self, ollama_llm_model):
        super().__init__()
        self.llm = ChatOllama(
            model=ollama_llm_model,
            temperature=0.2
        )

    def ask_llm(self, messages)  -> tuple[str, UsageMetadata]:
        response = self.llm.invoke(messages)
        return response.content, response.usage_metadata

    def with_structured_output(self, output_schema):
        return self.llm.with_structured_output(output_schema)