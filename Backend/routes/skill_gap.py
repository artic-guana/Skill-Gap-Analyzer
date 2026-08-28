from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from pydantic import BaseModel

from auth.auth_config import current_active_user
from auth.db import User

from models.skill_profile import SkillProfile
from models.skill_gap_result import (
    SkillGapResult
)

from services.target_skill_generator import (
    generate_required_skills
)

from services.skill_gap import (
    compare_skills
)


router = APIRouter(
    prefix="/api/v1/skill-gap",
    tags=["Skill Gap"]
)


def now():
    return datetime.now(timezone.utc)


class SkillGapRequest(BaseModel):
    job_role: str


@router.post("/analyze")
async def analyze_skill_gap(
    data: SkillGapRequest,

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

    required_skills = (
        generate_required_skills(
            data.job_role
        )
    )

    result = compare_skills(
        user_assessment=
            profile.assessment,

        required_skills=
            required_skills,

        cp_analysis=
            profile.competitive_programming
    )

    existing = await SkillGapResult.find_one(
        SkillGapResult.user_id ==
        user.id
    )

    if existing:

        existing.target_role = (
            data.job_role
        )

        existing.readiness_score = (
            result["readiness_score"]
        )

        existing.matched_skills = (
            result["matched_skills"]
        )

        existing.weak_skills = (
            result["weak_skills"]
        )

        existing.missing_skills = (
            result["missing_skills"]
        )

        existing.summary = (
            result["summary"]
        )

        existing.updated_at = now()

        await existing.save()

    else:

        existing = SkillGapResult(
            user_id=user.id,
            target_role=
                data.job_role,
            **result
        )

        await existing.insert()

    return {
        "message":
            "Skill gap generated successfully."
    }


@router.get("/me")
async def get_skill_gap(
    user: User = Depends(
        current_active_user
    )
):

    result = await SkillGapResult.find_one(
        SkillGapResult.user_id ==
        user.id
    )

    if not result:

        raise HTTPException(
            status_code=404,
            detail="Skill gap not found."
        )

    return result