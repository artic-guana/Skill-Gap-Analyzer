from collections import defaultdict
from datetime import date, timedelta

from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from auth.auth_config import (
    current_active_user,
)

from auth.db import User

from models.activity import Activity


router = APIRouter(
    prefix="/api/v1/activity",
    tags=["Activity"],
)


@router.get("/heatmap")
async def get_heatmap(
    year: int | None = Query(
        default=None
    ),
    user: User = Depends(
        current_active_user
    ),
):
    selected_year = (
        year or date.today().year
    )

    activities = await Activity.find(
        Activity.user_id == user.id
    ).to_list()

    counts = defaultdict(int)

    for activity in activities:

        activity_date = (
            activity.created_at.date()
        )

        if (
            activity_date.year
            != selected_year
        ):
            continue

        day_key = (
            activity_date.isoformat()
        )

        counts[day_key] += 1

    start_date = date(
        selected_year,
        1,
        1,
    )

    end_date = date(
        selected_year,
        12,
        31,
    )

    heatmap = []

    current = start_date

    while current <= end_date:

        current_string = (
            current.isoformat()
        )

        count = counts[
            current_string
        ]

        # react-activity-calendar
        # expects level from 0-4.
        if count == 0:
            level = 0

        elif count == 1:
            level = 1

        elif count <= 3:
            level = 2

        elif count <= 5:
            level = 3

        else:
            level = 4

        heatmap.append(
            {
                "date":
                    current_string,

                "count":
                    count,

                "level":
                    level,
            }
        )

        current += timedelta(
            days=1
        )

    total_activity = sum(
        item["count"]
        for item in heatmap
    )

    active_days = sum(
        1
        for item in heatmap
        if item["count"] > 0
    )

    return {
        "year":
            selected_year,

        "total_activity":
            total_activity,

        "active_days":
            active_days,

        "data":
            heatmap,
    }