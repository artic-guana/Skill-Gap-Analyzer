from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from auth.auth_config import current_active_user
from auth.db import User

from models.user_profile import UserProfile


router = APIRouter(
    prefix="/api/v1/profile",
    tags=["Profile"]
)


@router.get("/me")
async def get_profile(
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
            detail="Profile not found."
        )

    return profile