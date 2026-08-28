from datetime import datetime, timezone

from beanie import Document, PydanticObjectId
from pydantic import Field


def now():
    return datetime.now(timezone.utc)


class UserProfile(Document):
    user_id: PydanticObjectId

    full_name: str
    academic_level: str
    branch: str

    year_of_study: int
    study_hours_per_day: float

    github_username: str | None = None
    codeforces_handle: str | None = None

    created_at: datetime = Field(
        default_factory=now
    )

    updated_at: datetime = Field(
        default_factory=now
    )

    class Settings:
        name = "user_profiles"