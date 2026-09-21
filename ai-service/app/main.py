from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.embedding.scheduler import EmbeddingScheduler
from app.routers import chat, story_unit_data, test
from app.container.service_container import ServiceContainer


container = ServiceContainer.get_service_container()

embedding_scheduler = EmbeddingScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    global embedding_scheduler
    embedding_scheduler.start()
    print("PlotGuard AI service started.")
    yield
    print("PlotGuard AI service stopped.")


app = FastAPI(
    title="PlotGuard AI Service",
    lifespan=lifespan,
    root_path="/api/ai"
)


app.include_router(chat.router)
app.include_router(story_unit_data.router)
app.include_router(test.router)


@app.get("")
def hello():
    return "hello, world"
