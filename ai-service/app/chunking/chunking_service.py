from langchain_text_splitters import RecursiveCharacterTextSplitter
from transformers import AutoTokenizer


class ChunkingService:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen3-Embedding-0.6B")
        self.splitter = (RecursiveCharacterTextSplitter
            .from_huggingface_tokenizer(
                self.tokenizer,
                chunk_size=250,
                chunk_overlap=40,
                separators=[
                    "\n\n",
                    "\n",
                    ". ",
                    "? ",
                    "! ",
                    "; ",
                    ", ",
                    " ",
                    ""]
            )
        )

    def split(self, text: str) -> list[str]:
        return self.splitter.split_text(text)