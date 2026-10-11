from langchain_google_genai import ChatGoogleGenerativeAI
from app.llm.chat_model import ChatModel


class GeminiChatModel(ChatModel):
    def __init__(self, gemini_llm_model, gemini_api_key):
        super().__init__()
        self._gemini_llm_model = gemini_llm_model
        self._gemini_api_key = gemini_api_key

        self.llm = ChatGoogleGenerativeAI(
            model=self._gemini_llm_model,
            google_api_key=self._gemini_api_key,
            temperature=0.2
        )

    def ask_llm(self, messages):
        response = self.llm.invoke(messages)
        return response.content[0]['text']
    
    def with_structured_output(self, output_schema):
        return self.llm.with_structured_output(output_schema)