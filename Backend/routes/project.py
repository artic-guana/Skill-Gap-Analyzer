from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from pydantic import BaseModel

from auth.auth_config import current_active_user
from auth.db import User

from models.project_result import ProjectResult

from services.github_loader import (
    load_github_readme
)

from services.project_analyzer import (
    analyze_project
)


router = APIRouter(
    prefix="/api/v1/project",
    tags=["Project"]
)


class ProjectRequest(BaseModel):
    repo_url: str


@router.post("/analyze")
async def analyze_repository(
    data: ProjectRequest,

    user: User = Depends(
        current_active_user
    )
):

    try:

        document = load_github_readme(
            data.repo_url
        )

        analysis = analyze_project(
            repository=data.repo_url,
            readme_text=
                document.page_content
        )

        result = ProjectResult(
            user_id=user.id,

            repository=
                data.repo_url,

            project_name=
                analysis.get(
                    "project_name",
                    ""
                ),

            summary=
                analysis.get(
                    "summary",
                    ""
                ),

            project_type=
                analysis.get(
                    "project_type",
                    ""
                ),

            technologies=
                analysis.get(
                    "technologies",
                    []
                ),

            features=
                analysis.get(
                    "features",
                    []
                ),

            skills_demonstrated=
                analysis.get(
                    "skills_demonstrated",
                    []
                ),

            difficulty=
                analysis.get(
                    "difficulty",
                    ""
                ),

            score=
                analysis.get(
                    "score",
                    0
                ),

            ai_input=
                analysis.get(
                    "ai_input",
                    ""
                )
        )

        await result.insert()

        return {
            "message":
                "Project analyzed successfully.",
            "project_id":
                str(result.id)
        }

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


@router.get("/me")
async def get_projects(
    user: User = Depends(
        current_active_user
    )
):

    return await ProjectResult.find(
        ProjectResult.user_id ==
        user.id
    ).to_list()