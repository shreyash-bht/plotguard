import psycopg
from app.config import DATABASE_URL

class PostgresChatLoader:
    def __init__(self, connection_string: str = DATABASE_URL):
        self.connection_string = connection_string

    def get_chat_history(self, conversation_id: str, limit: int = 10) -> list[dict]:
        """Fetch last N messages in chronological order [oldest -> newest]."""
        query = """
            SELECT role, content
            FROM (
                SELECT role, content, created_at
                FROM messages
                WHERE conversation_id = %s
                ORDER BY created_at DESC
                LIMIT %s
            ) sub
            ORDER BY created_at ASC
        """
        with psycopg.connect(self.connection_string) as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (conversation_id, limit))
                rows = cursor.fetchall()

        return [{"role": row[0], "content": row[1]} for row in rows]

    def save_turn(self, conversation_id: str, user_msg: str, ai_msg: str):
        """Save user query and AI response in a single batch transaction."""
        query = """
            INSERT INTO messages (conversation_id, role, content)
            VALUES (%s, %s, %s)
        """
        data = [
            (conversation_id, "user", user_msg),
            (conversation_id, "assistant", ai_msg)
        ]
        with psycopg.connect(self.connection_string) as conn:
            with conn.cursor() as cursor:
                cursor.executemany(query, data)
                conn.commit()


    def create_conversation(self, user_id: str, content_id: str, max_story_order: int):
        print("user id is ", user_id, " ", content_id, " ", max_story_order)
        query = """
            INSERT INTO conversations (user_id, content_id, max_story_order)
            VALUES (%s, %s, %s)
            RETURNING user_id, content_id, max_story_order, conversation_id
        """
        saved_row = None

        with psycopg.connect(self.connection_string) as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (user_id, content_id, max_story_order))
                saved_row = cursor.fetchone()
                conn.commit()

        return saved_row
        