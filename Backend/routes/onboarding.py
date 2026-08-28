from datetime import datetime, timezone
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from auth.auth_config import current_active_user
from auth.db import User

from models.user_profile import UserProfile
from models.skill_profile import SkillProfile
from models.career_result import CareerResult

from services.resume_loader import resume_to_text
from services.ats_scorer import calculate_ats_score
from services.github_loader import load_user_repositories
from services.codeforces_service import (
    analyze_codeforces_skills
)

from services.skill_extractor import extract_skills
from services.skill_assessor import assess_skills

from services.recommend_service import (
    get_placement_insight
)


router = APIRouter(
    prefix="/api/v1/onboarding",
    tags=["Onboarding"]
)


def now():
    return datetime.now(timezone.utc)


@router.post("")
async def onboarding(
    full_name: str = Form(...),
    academic_level: str = Form(...),
    branch: str = Form(...),
    year_of_study: int = Form(...),
    study_hours_per_day: float = Form(...),

    github_username: str = Form(...),

    codeforces_handle: Optional[str] = Form(None),

    resume: Optional[UploadFile] = File(None),

    user: User = Depends(
        current_active_user
    )
):
    try:

        if year_of_study < 1:
            raise HTTPException(
                status_code=400,
                detail="Invalid year of study."
            )

        if study_hours_per_day <= 0:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Study hours must be greater than 0."
                )
            )

        # ---------------------------------
        # Resume
        # ---------------------------------

        resume_text = ""

        if resume:
            resume_text = await resume_to_text(
                resume
            )

        ats_score = calculate_ats_score(
            resume_text
        )

        # ---------------------------------
        # GitHub
        # ---------------------------------

        github_documents = (
            load_user_repositories(
                github_username
            )
        )

        if (
            not github_documents
            and not resume_text
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "No GitHub README or "
                    "resume evidence found."
                )
            )

        # ---------------------------------
        # Skills
        # ---------------------------------

        skills = extract_skills(
            resume_text=resume_text,
            github_documents=github_documents
        )

        assessment = {
            "skills": []
        }

        if skills:
            assessment = assess_skills(
                skills=skills,
                resume_text=resume_text,
                github_documents=github_documents
            )

        # ---------------------------------
        # Codeforces
        # ---------------------------------

        cp_analysis = None

        if codeforces_handle:

            cp_analysis = (
                analyze_codeforces_skills(
                    codeforces_handle
                )
            )

        # ---------------------------------
        # Career recommendations
        # ---------------------------------

        careers = get_placement_insight(
            branch=branch,
            academic_level=academic_level
        )

        # ---------------------------------
        # User profile
        # ---------------------------------

        profile = await UserProfile.find_one(
            UserProfile.user_id ==
            user.id
        )

        if profile:

            profile.full_name = full_name
            profile.academic_level = (
                academic_level
            )
            profile.branch = branch
            profile.year_of_study = (
                year_of_study
            )
            profile.study_hours_per_day = (
                study_hours_per_day
            )

            profile.github_username = (
                github_username
            )

            profile.codeforces_handle = (
                codeforces_handle
            )

            profile.updated_at = now()

            await profile.save()

        else:

            profile = UserProfile(
                user_id=user.id,
                full_name=full_name,
                academic_level=academic_level,
                branch=branch,
                year_of_study=year_of_study,
                study_hours_per_day=
                    study_hours_per_day,
                github_username=
                    github_username,
                codeforces_handle=
                    codeforces_handle
            )

            await profile.insert()

        # ---------------------------------
        # Skill profile
        # ---------------------------------

        skill_profile = (
            await SkillProfile.find_one(
                SkillProfile.user_id ==
                user.id
            )
        )

        if skill_profile:

            skill_profile.github_username = (
                github_username
            )

            skill_profile.codeforces_handle = (
                codeforces_handle
            )

            skill_profile.repositories_analyzed = (
                len(github_documents)
            )

            skill_profile.skills_found = skills

            skill_profile.assessment = (
                assessment.get(
                    "skills",
                    []
                )
            )

            skill_profile.ats_score = ats_score

            skill_profile.competitive_programming = (
                cp_analysis
            )

            skill_profile.updated_at = now()

            await skill_profile.save()

        else:

            skill_profile = SkillProfile(
                user_id=user.id,

                github_username=
                    github_username,

                codeforces_handle=
                    codeforces_handle,

                repositories_analyzed=
                    len(github_documents),

                skills_found=skills,

                assessment=
                    assessment.get(
                        "skills",
                        []
                    ),

                ats_score=ats_score,

                competitive_programming=
                    cp_analysis
            )

            await skill_profile.insert()

        # ---------------------------------
        # Career result
        # ---------------------------------

        career_result = (
            await CareerResult.find_one(
                CareerResult.user_id ==
                user.id
            )
        )

        if career_result:

            career_result.branch = branch
            career_result.academic_level = (
                academic_level
            )

            career_result.roles = careers.get(
                "Roles",
                []
            )

            career_result.ai_input = careers.get(
                "AI Input",
                ""
            )

            career_result.updated_at = now()

            await career_result.save()

        else:

            career_result = CareerResult(
                user_id=user.id,
                branch=branch,
                academic_level=
                    academic_level,

                roles=careers.get(
                    "Roles",
                    []
                ),

                ai_input=careers.get(
                    "AI Input",
                    ""
                )
            )

            await career_result.insert()

        return {
            "message":
                "Onboarding completed successfully.",
            "ats_score": ats_score,
        }

    except HTTPException:
        raise

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )