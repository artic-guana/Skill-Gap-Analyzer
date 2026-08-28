from datetime import datetime, timezone

from beanie import Document, PydanticObjectId
from pydantic import Field


def now():
    return datetime.now(timezone.utc)


class ProjectResult(Document):
    user_id: PydanticObjectId

    repository: str
    project_name: str

    summary: str = ""
    project_type: str = ""

    technologies: list = Field(
        default_factory=list
    )

    features: list = Field(
        default_factory=list
    )

    skills_demonstrated: list = Field(
        default_factory=list
    )

    difficulty: str = ""
    score: int = 0

    ai_input: str = ""

    created_at: datetime = Field(
        default_factory=now
    )

    class Settings:
        name = "project_results"