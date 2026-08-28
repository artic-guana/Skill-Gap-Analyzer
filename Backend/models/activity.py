from datetime import datetime, timezone

from beanie import Document, PydanticObjectId
from pydantic import Field


class Activity(Document):
    user_id: PydanticObjectId

    activity_type: str

    # Identifies the roadmap/project/subtopic that caused
    # this activity.
    reference_id: str | None = None

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    class Settings:
        name = "activities"