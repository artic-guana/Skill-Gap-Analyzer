from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from auth.auth_config import current_active_user
from auth.db import User

from models.skill_profile import SkillProfile


router = APIRouter(
    prefix="/api/v1/skills",
    tags=["Skills"]
)


@router.get("/me")
async def get_my_skills(
    user: User = Depends(
        current_active_user
    )
):
    profile = await SkillProfile.find_one(
        SkillProfile.user_id ==
        user.id
    )

    if not profile:

        raise HTTPException(
            status_code=404,
            detail=(
                "Skill profile not found. "
                "Complete onboarding first."
            )
        )

    return profile