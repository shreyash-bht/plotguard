from dataclasses import dataclass, field


@dataclass(frozen=True)
class RetrievalCase:
    id: str
    query: str
    relevant_episodes: set[str]
    relevant_chunks: set[str]
    max_story_order: int
    content_id: str


@dataclass(frozen=True)
class RetrievalCaseResult:
    case_id: str
    query: str

    expected_episodes: set[str]
    retrieved_episodes: set[str]

    expected_chunks: set[str]
    retrieved_chunks: set[str]

    recall: float
    precision: float


@dataclass(frozen=True)
class RetrievalEvaluationResult:
    total_cases: int
    recall: float
    precision: float
    cases: list[RetrievalCaseResult] = field(default_factory=list)