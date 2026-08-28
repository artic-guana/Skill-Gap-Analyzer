from datetime import datetime, timezone

from beanie import Document, PydanticObjectId
from pydantic import Field


def now():
    return datetime.now(timezone.utc)


class CareerResult(Document):
    user_id: PydanticObjectId

    branch: str
    academic_level: str

    roles: list = Field(
        default_factory=list
    )

    ai_input: str = ""

    created_at: datetime = Field(
        default_factory=now
    )

    updated_at: datetime = Field(
        default_factory=now
    )

    class Settings:
        name = "career_results"