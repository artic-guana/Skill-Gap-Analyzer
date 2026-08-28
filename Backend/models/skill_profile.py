from datetime import datetime, timezone

from beanie import Document, PydanticObjectId
from pydantic import Field


def now():
    return datetime.now(timezone.utc)


class SkillProfile(Document):
    user_id: PydanticObjectId

    github_username: str | None = None
    codeforces_handle: str | None = None

    repositories_analyzed: int = 0

    skills_found: list = Field(
        default_factory=list
    )

    assessment: list = Field(
        default_factory=list
    )

    competitive_programming: dict | None = None

    created_at: datetime = Field(
        default_factory=now
    )

    updated_at: datetime = Field(
        default_factory=now
    )

    class Settings:
        name = "skill_profiles"