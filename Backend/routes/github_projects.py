from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from auth.auth_config import (
    current_active_user,
)

from auth.db import User

from models.user_profile import (
    UserProfile,
)

from models.github_project_result import (
    GithubProjectResult,
)

from services.github_project_analyzer import (
    analyze_github_projects,
)


router = APIRouter(
    prefix="/api/v1/github-projects",
    tags=["GitHub Projects"],
)


def now():
    return datetime.now(
        timezone.utc
    )


@router.post("/analyze")
async def analyze_all_projects(
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


    github_username = (
        profile.github_username
    )


    if not github_username:

        raise HTTPException(
            status_code=400,
            detail=(
                "GitHub username is not available."
            )
        )


    try:

        projects = (
            analyze_github_projects(
                github_username
            )
        )


        # Remove old analysis first
        await GithubProjectResult.find(
            GithubProjectResult.user_id ==
            user.id
        ).delete()


        saved_projects = []


        for project in projects:

            document = (
                GithubProjectResult(
                    user_id=
                        user.id,

                    github_username=
                        github_username,

                    repo_name=
                        project[
                            "repo_name"
                        ],

                    repo_url=
                        project[
                            "repo_url"
                        ],

                    summary=
                        project[
                            "summary"
                        ],

                    difficulty=
                        project[
                            "difficulty"
                        ],

                    technologies=
                        project[
                            "technologies"
                        ],

                    skills_demonstrated=
                        project[
                            "skills_demonstrated"
                        ],

                    stars=
                        project[
                            "stars"
                        ],

                    forks=
                        project[
                            "forks"
                        ],

                    analyzed_at=
                        now(),
                )
            )


            await document.insert()


            saved_projects.append(
                {
                    "id":
                        str(
                            document.id
                        ),

                    "repo_name":
                        document.repo_name,

                    "repo_url":
                        document.repo_url,

                    "summary":
                        document.summary,

                    "difficulty":
                        document.difficulty,

                    "technologies":
                        document.technologies,

                    "skills_demonstrated":
                        document.skills_demonstrated,

                    "stars":
                        document.stars,

                    "forks":
                        document.forks,
                }
            )


        return {
            "github_username":
                github_username,

            "count":
                len(
                    saved_projects
                ),

            "projects":
                saved_projects,
        }


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@router.get("/me")
async def get_my_github_projects(
    user: User = Depends(
        current_active_user
    )
):

    projects = (
        await GithubProjectResult.find(
            GithubProjectResult.user_id ==
            user.id
        ).to_list()
    )


    return {
        "count":
            len(projects),

        "projects":
            [
                {
                    "id":
                        str(
                            project.id
                        ),

                    "repo_name":
                        project.repo_name,

                    "repo_url":
                        project.repo_url,

                    "summary":
                        project.summary,

                    "difficulty":
                        project.difficulty,

                    "technologies":
                        project.technologies,

                    "skills_demonstrated":
                        project.skills_demonstrated,

                    "stars":
                        project.stars,

                    "forks":
                        project.forks,

                    "analyzed_at":
                        project
                        .analyzed_at
                        .isoformat(),
                }

                for project
                in projects
            ],
        }