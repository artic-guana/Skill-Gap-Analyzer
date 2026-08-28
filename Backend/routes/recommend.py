from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from auth.auth_config import current_active_user
from auth.db import User

from models.user_profile import UserProfile
from models.career_result import CareerResult

from services.recommend_service import (
    get_placement_insight
)


router = APIRouter(
    prefix="/api/v1/recommendations",
    tags=["Recommendations"]
)


def now():
    return datetime.now(timezone.utc)


@router.post("/generate")
async def generate_recommendations(
    user: User = Depends(
        current_active_user
    )
):

    profile = await UserProfile.find_one(
        UserProfile.user_id ==
        user.id
    )

    if not profile:

        raise HTTPException(
            status_code=404,
            detail="Complete onboarding first."
        )

    result = get_placement_insight(
        branch=profile.branch,
        academic_level=
            profile.academic_level
    )

    existing = await CareerResult.find_one(
        CareerResult.user_id ==
        user.id
    )

    if existing:

        existing.branch = profile.branch

        existing.academic_level = (
            profile.academic_level
        )

        existing.roles = result.get(
            "Roles",
            []
        )

        existing.ai_input = result.get(
            "AI Input",
            ""
        )

        existing.updated_at = now()

        await existing.save()

    else:

        existing = CareerResult(
            user_id=user.id,
            branch=profile.branch,
            academic_level=
                profile.academic_level,

            roles=result.get(
                "Roles",
                []
            ),

            ai_input=result.get(
                "AI Input",
                ""
            )
        )

        await existing.insert()

    return {
        "message":
            "Recommendations generated."
    }


@router.get("/me")
async def get_recommendations(
    user: User = Depends(
        current_active_user
    )
):

    result = await CareerResult.find_one(
        CareerResult.user_id ==
        user.id
    )

    if not result:

        raise HTTPException(
            status_code=404,
            detail=(
                "Career recommendations "
                "not found."
            )
        )

    return result