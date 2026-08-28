from datetime import datetime, timezone

from beanie import Document, PydanticObjectId
from pydantic import Field


def now():
    return datetime.now(timezone.utc)


class RoadmapResult(Document):
    user_id: PydanticObjectId

    target_role: str

    ai_input: str = ""

    estimated_total_hours: float = 0

    roadmap: list = Field(
        default_factory=list
    )

    created_at: datetime = Field(
        default_factory=now
    )

    updated_at: datetime = Field(
        default_factory=now
    )

    class Settings:
        name = "roadmap_results"