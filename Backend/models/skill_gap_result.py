from datetime import datetime, timezone

from beanie import Document, PydanticObjectId
from pydantic import Field


def now():
    return datetime.now(timezone.utc)


class SkillGapResult(Document):
    user_id: PydanticObjectId

    target_role: str

    readiness_score: float = 0

    matched_skills: list = Field(
        default_factory=list
    )

    weak_skills: list = Field(
        default_factory=list
    )

    missing_skills: list = Field(
        default_factory=list
    )

    summary: dict = Field(
        default_factory=dict
    )

    created_at: datetime = Field(
        default_factory=now
    )

    updated_at: datetime = Field(
        default_factory=now
    )

    class Settings:
        name = "skill_gap_results"