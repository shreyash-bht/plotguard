from dataclasses import dataclass
import psycopg
from app.config.config import DATABASE_URL


@dataclass
class ChatMessage:
    role: str
    original_content: str
    contextualized_content: str | None


@dataclass
class Conversation:
    conversation_id: str
    user_id: str
    content_id: str
    max_story_order: int


class PostgresChatRepository:
    def __init__(self, connection_string: str = DATABASE_URL):
        self.connection_string = connection_string

    def get_chat_history(
        self,
        conversation_id: str,
        limit: int = 10,
    ) -> list[ChatMessage]:
        query = """
            SELECT
                role,
                original_content,
                contextualized_content
            FROM (
                SELECT
                    role,
                    original_content,
                    contextualized_content,
                    created_at
                FROM messages
                WHERE conversation_id = %s
                ORDER BY created_at DESC
                LIMIT %s
            ) recent
            ORDER BY created_at ASC
        """
        with psycopg.connect(self.connection_string) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    query,
                    (conversation_id, limit),
                )

                rows = cursor.fetchall()

        return [
            ChatMessage(
                role=row[0],
                original_content=row[1],
                contextualized_content=row[2],
            )
            for row in rows
        ]


    def save_turn(
        self,
        conversation_id: str,
        user_question: str,
        contextualized_question: str,
        assistant_answer: str,
    ) -> None:
        query = """
            INSERT INTO messages (
                conversation_id,
                role,
                original_content,
                contextualized_content
            )
            VALUES
                (%s, %s, %s, %s),
                (%s, %s, %s, %s)
        """

        with psycopg.connect(self.connection_string) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    query,
                    (
                        conversation_id,
                        "user",
                        user_question,
                        contextualized_question,

                        conversation_id,
                        "assistant",
                        assistant_answer,
                        None,
                    ),
                )

    def create_conversation(
        self,
        user_id: str,
        content_id: str,
        max_story_order: int,
    ) -> Conversation:
        query = """
            INSERT INTO conversations (
                user_id,
                content_id,
                max_story_order
            )
            VALUES (%s, %s, %s)
            RETURNING
                conversation_id,
                user_id,
                content_id,
                max_story_order
        """

        with psycopg.connect(self.connection_string) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    query,
                    (
                        user_id,
                        content_id,
                        max_story_order,
                    ),
                )

                row = cursor.fetchone()

        return Conversation(
            conversation_id=row[0],
            user_id=row[1],
            content_id=row[2],
            max_story_order=row[3],
        )