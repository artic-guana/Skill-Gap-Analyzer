from contextlib import asynccontextmanager
import os

from fastapi import FastAPI
from fastapi.middleware.cors import (
    CORSMiddleware
)
from beanie import init_beanie



# Application routes

from routes.onboarding import (
    router as onboarding_router
)

from routes.profile import (
    router as profile_router
)

from routes.skills import (
    router as skills_router
)

from routes.activity import router as activity_router

from routes.recommend import (
    router as recommend_router
)

from routes.skill_gap import (
    router as skill_gap_router
)

from routes.roadmap import (
    router as roadmap_router
)

from routes.project import (
    router as project_router
)

from routes.github_projects import (
    router as github_projects_router,
)


# Authentication

from auth.db import db, User

from auth.auth_config import (
    fastapi_users,
    auth_backend,
)

from auth.schemas import (
    UserRead,
    UserCreate,
    UserUpdate,
)


# MongoDB Models

from models.user_profile import UserProfile
from models.skill_profile import SkillProfile
from models.career_result import CareerResult
from models.skill_gap_result import SkillGapResult
from models.roadmap_result import RoadmapResult
from models.project_result import ProjectResult
from models.activity import Activity
from models.github_project_result import GithubProjectResult


@asynccontextmanager
async def lifespan(
    app: FastAPI
):

    await init_beanie(
        database=db,

        document_models=[
            User,
            UserProfile,
            SkillProfile,
            CareerResult,
            SkillGapResult,
            RoadmapResult,
            ProjectResult,
            Activity,
            GithubProjectResult,
        ]
    )

    yield


app = FastAPI(
    title="AI Skill Gap Analyzer API",
    version="2.0.0",
    lifespan=lifespan
)

origin1 = os.getenv("LOCALHOST_ONE")
origin2 = os.getenv("LOCALHOST_TWO")

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        origin1,
        origin2,
    ],

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ],
)


# Authentication

app.include_router(
    fastapi_users.get_auth_router(
        auth_backend
    ),

    prefix="/api/v1/auth",

    tags=[
        "Auth"
    ]
)

    
app.include_router(
    fastapi_users.get_register_router(
        UserRead,
        UserCreate
    ),

    prefix="/api/v1/auth",

    tags=[
        "Auth"
    ]
)


app.include_router(
    fastapi_users.get_users_router(
        UserRead,
        UserUpdate
    ),

    prefix="/api/v1/users",

    tags=[
        "Users"
    ]
)


# Application routes

app.include_router(
    onboarding_router
)

app.include_router(
    profile_router
)

app.include_router(
    skills_router
)

app.include_router(
    recommend_router
)

app.include_router(
    skill_gap_router
)

app.include_router(
    roadmap_router
)

app.include_router(
    project_router
)


app.include_router(
    activity_router
)

app.include_router(
    github_projects_router
)


@app.get("/")
def root():

    return {
        "message":
            "AI Skill Gap Analyzer API is running"
    }


@app.get("/health")
def health():

    return {
        "status": "ok"
    }