from typing import Literal

from pydantic import BaseModel

import re

Intent = Literal["FACTUAL", "SUMMARY", "LENGTHY", "NONE"]


class RoutedQuery(BaseModel):
    query: str
    was_contextualized: bool
    intent: Intent
    confidence: Literal["high", "medium", "low"] = "medium"
    """Explicit episode range in the question, e.g. "1-30"; null otherwise."""
    episode_scope: str | None = None


_RANGE_PATTERN = re.compile(
    r"\bep(?:isode)?s?\s+(\d+)\s*(?:-|\u2013|\u2014|to|through|till|until)\s*(\d+)\b",
    re.IGNORECASE,
)
_FIRST_N_PATTERN = re.compile(
    r"\b(?:first|initial)\s+(\d+)\s+episodes?\b",
    re.IGNORECASE,
)


def parse_episode_scope(question: str) -> str | None:
    """Extract an explicit episode range ("1-30") from question text. Used as a
    code-level fallback when the LLM omits episode_scope."""
    match = _RANGE_PATTERN.search(question)
    if match:
        start, end = sorted((int(match.group(1)), int(match.group(2))))
        return f"{start}-{end}"
    match = _FIRST_N_PATTERN.search(question)
    if match:
        return f"1-{match.group(1)}"
    return None
