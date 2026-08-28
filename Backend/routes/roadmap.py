from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from pydantic import BaseModel

from auth.auth_config import current_active_user
from auth.db import User

from models.user_profile import UserProfile
from models.skill_gap_result import SkillGapResult
from models.roadmap_result import RoadmapResult
from models.activity import Activity

from services.roadmap_generator import (
    generate_roadmap
)

from services.resource_search import (
    attach_resources
)


router = APIRouter(
    prefix="/api/v1/roadmap",
    tags=["Roadmap"]
)


def now():
    return datetime.now(
        timezone.utc
    )


class RoadmapRequest(BaseModel):
    job_role: str


class ProgressUpdate(BaseModel):
    skill_index: int
    subtopic_index: int
    completed: bool


@router.post("/generate")
async def create_roadmap(
    data: RoadmapRequest,

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
            detail=(
                "Complete onboarding first."
            )
        )

    skill_gap = await SkillGapResult.find_one(
        SkillGapResult.user_id ==
        user.id
    )

    if not skill_gap:

        raise HTTPException(
            status_code=404,
            detail=(
                "Generate your skill gap first."
            )
        )

    if (
        skill_gap.target_role.lower()
        !=
        data.job_role.lower()
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Skill gap does not match "
                "the requested target role."
            )
        )

    try:

        roadmap = generate_roadmap(
            job_role=
                data.job_role,

            weak_skills=
                skill_gap.weak_skills,

            missing_skills=
                skill_gap.missing_skills,

            academic_level=
                profile.academic_level,

            year_of_study=
                profile.year_of_study,

            study_hours_per_day=
                profile.study_hours_per_day
        )


        roadmap = attach_resources(
            roadmap=roadmap,

            academic_level=
                profile.academic_level,

            year_of_study=
                profile.year_of_study,

            study_hours_per_day=
                profile.study_hours_per_day
        )


        existing = (
            await RoadmapResult.find_one(
                RoadmapResult.user_id ==
                user.id
            )
        )


        if existing:

            existing.target_role = (
                data.job_role
            )

            existing.ai_input = (
                roadmap.get(
                    "ai_input",
                    ""
                )
            )

            existing.estimated_total_hours = (
                roadmap.get(
                    "estimated_total_hours",
                    0
                )
            )

            existing.roadmap = (
                roadmap.get(
                    "roadmap",
                    []
                )
            )

            existing.updated_at = (
                now()
            )

            await existing.save()


        else:

            existing = RoadmapResult(
                user_id=
                    user.id,

                target_role=
                    data.job_role,

                ai_input=
                    roadmap.get(
                        "ai_input",
                        ""
                    ),

                estimated_total_hours=
                    roadmap.get(
                        "estimated_total_hours",
                        0
                    ),

                roadmap=
                    roadmap.get(
                        "roadmap",
                        []
                    ),

                updated_at=
                    now()
            )

            await existing.insert()


        return {
            "message":
                "Roadmap generated successfully.",

            "target_role":
                existing.target_role,

            "estimated_total_hours":
                existing.estimated_total_hours,

            "roadmap":
                existing.roadmap
        }


    except HTTPException:
        raise


    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@router.get("/me")
async def get_roadmap(
    user: User = Depends(
        current_active_user
    )
):

    roadmap = await RoadmapResult.find_one(
        RoadmapResult.user_id ==
        user.id
    )

    if not roadmap:

        raise HTTPException(
            status_code=404,
            detail=(
                "Roadmap not found."
            )
        )

    return roadmap


@router.patch("/progress")
async def update_roadmap_progress(
    data: ProgressUpdate,

    user: User = Depends(
        current_active_user
    )
):

    roadmap = await RoadmapResult.find_one(
        RoadmapResult.user_id ==
        user.id
    )

    if not roadmap:

        raise HTTPException(
            status_code=404,
            detail=(
                "Roadmap not found."
            )
        )


    roadmap_items = (
        roadmap.roadmap or []
    )


    if (
        data.skill_index < 0
        or
        data.skill_index >=
        len(roadmap_items)
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid skill index."
            )
        )


    skill = roadmap_items[
        data.skill_index
    ]


    if isinstance(
        skill,
        dict
    ):

        subtopics = (
            skill.get(
                "subtopics",
                []
            )
        )

    else:

        subtopics = (
            skill.subtopics
        )


    if (
        data.subtopic_index < 0
        or
        data.subtopic_index >=
        len(subtopics)
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid subtopic index."
            )
        )


    subtopic = subtopics[
        data.subtopic_index
    ]


    if isinstance(
        subtopic,
        dict
    ):

        previous_completed = (
            subtopic.get(
                "completed",
                False
            )
        )

        subtopic["completed"] = (
            data.completed
        )

    else:

        previous_completed = (
            subtopic.completed
        )

        subtopic.completed = (
            data.completed
        )


    roadmap.updated_at = (
        now()
    )

    await roadmap.save()


    reference_id = (
        f"roadmap:"
        f"{roadmap.id}:"
        f"{data.skill_index}:"
        f"{data.subtopic_index}"
    )


    # Add heatmap activity only when
    # changing incomplete -> complete.
    if (
        data.completed
        and
        not previous_completed
    ):

        existing_activity = (
            await Activity.find_one(
                Activity.user_id ==
                    user.id,

                Activity.reference_id ==
                    reference_id
            )
        )


        if not existing_activity:

            activity = Activity(
                user_id=
                    user.id,

                activity_type=
                    "roadmap_subtopic_completed",

                reference_id=
                    reference_id
            )

            await activity.insert()


    # If user unchecks the item,
    # remove the corresponding activity.
    if (
        not data.completed
        and
        previous_completed
    ):

        existing_activity = (
            await Activity.find_one(
                Activity.user_id ==
                    user.id,

                Activity.reference_id ==
                    reference_id
            )
        )

        if existing_activity:

            await existing_activity.delete()


    return {
        "message":
            "Roadmap progress updated.",

        "skill_index":
            data.skill_index,

        "subtopic_index":
            data.subtopic_index,

        "completed":
            data.completed
    }