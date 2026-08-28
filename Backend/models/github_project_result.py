from datetime import datetime, timezone

from beanie import Document, PydanticObjectId
from pydantic import Field


class GithubProjectResult(Document):
    user_id: PydanticObjectId

    github_username: str
    repo_name: str
    repo_url: str

    summary: str

    difficulty: str

    technologies: list[str] = []

    skills_demonstrated: list[str] = []

    stars: int = 0
    forks: int = 0

    analyzed_at: datetime = Field(
        default_factory=lambda:
            datetime.now(timezone.utc)
    )

    class Settings:
        name = "github_project_results"