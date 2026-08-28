# services/roadmap_generator.py

import json

from langchain_core.prompts import ChatPromptTemplate
from langchain_mistralai import ChatMistralAI


llm = ChatMistralAI(
    model="mistral-small-latest",
    temperature=0
)


prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are a personalized technical learning roadmap generator.

Generate an efficient and practical learning roadmap for a user
trying to reach a target technical job role.

You will receive:

- Target job role
- Weak skills
- Missing skills
- Academic level
- Year of study
- Available study hours per day

You MUST use all of these factors when generating the roadmap.


PERSONALIZATION RULES

Academic Level:

Diploma:
- Prioritize practical implementation.
- Focus on job-ready skills.
- Avoid excessive theoretical depth unless required.

B.Tech / B.E.:
- Balance fundamentals, implementation, projects,
  interview preparation and placement readiness.

M.Tech / M.E.:
- Include deeper specialization.
- Include advanced technical concepts.
- Prefer stronger technical projects and deeper implementation.

B.Sc:
- Prioritize fundamentals, programming,
  analytical skills and technical applications.

M.Sc:
- Include stronger theory, analysis,
  specialization and advanced applications.

PhD:
- Prioritize advanced specialization,
  research, experimentation and expert-level concepts.


Year of Study:

Year 1:
- Prioritize prerequisites and fundamentals.
- Avoid unnecessary advanced material.

Year 2:
- Strengthen core technical skills.
- Introduce practical implementation and small projects.

Year 3:
- Prioritize specialization.
- Include portfolio projects.
- Prepare for internships and technical interviews.

Year 4:
- Prioritize placements.
- Prioritize high-impact missing skills.
- Include interview readiness and production-level projects.

For postgraduate programs, interpret year of study
relative to that academic program.


Study Hours Per Day:

Low available time:
- Include only high-impact topics.
- Prefer concise resources.
- Avoid optional or low-value material.

Moderate available time:
- Balance concepts, practice and projects.

High available time:
- Allow deeper study.
- Include additional practice and advanced subtopics.

The roadmap should reach useful job readiness
in the minimum reasonable amount of time.


SKILL PRIORITIZATION

- Missing high-importance skills should generally come first.
- Weak high-importance skills should come next.
- Prerequisites must appear before dependent skills.
- Do not repeat skills unnecessarily.
- Do not include skills unrelated to the target role.
- Do not create an unnecessarily long roadmap.


SUBTOPICS

Each roadmap skill must contain ordered subtopics.

For each subtopic provide:

- order
- title
- description
- estimated_hours
- article_query
- video_query
- completed

Search queries should be specific enough to find
good educational content.

Do NOT generate URLs.

The article/video queries should account for:
- academic level
- current year
- required depth
- target role
- efficient learning


PROJECTS

Each major skill must have one practical project.

The project should:
- demonstrate the skill clearly
- be relevant to the target job role
- have difficulty appropriate to the user's academic level
- be appropriate to the user's year of study
- be verifiable from a GitHub repository

Include:
- title
- description
- skills_verified
- verification_required
- completed


AI INPUT

Generate a concise "ai_input" explaining the
personalization decisions.

Explain:
- why certain gaps were prioritized
- how topic depth was selected
- how academic level influenced the roadmap
- how year of study influenced priorities
- how available study time influenced roadmap length
- how the sequence helps the user reach the role efficiently

Do NOT simply repeat the provided input values.


OUTPUT FORMAT

Return ONLY valid JSON.

Use exactly this structure:

{{
    "ai_input":
        "Concise explanation of personalization decisions.",

    "estimated_total_hours": 40,

    "roadmap": [
        {{
            "order": 1,

            "skill": "Docker",

            "goal":
                "Learn practical Docker skills for backend development.",

            "estimated_hours": 12,

            "subtopics": [
                {{
                    "order": 1,

                    "title":
                        "Images and Containers",

                    "description":
                        "Understand Docker images, containers and their lifecycle.",

                    "estimated_hours": 2,

                    "article_query":
                        "Docker images containers beginner practical tutorial",

                    "video_query":
                        "Docker images containers practical tutorial",

                    "completed": false
                }}
            ],

            "project": {{
                "title":
                    "Containerized Backend API",

                "description":
                    "Build and containerize a backend API with a database.",

                "skills_verified": [
                    "Docker"
                ],

                "verification_required": true,

                "completed": false
            }}
        }}
    ]
}}


STRICT RULES

- Return JSON only.
- Do not return markdown.
- Do not use ```json.
- Do not generate URLs.
- estimated_hours must be numeric.
- estimated_total_hours must be numeric.
- completed must initially be false.
- verification_required must be true.
- roadmap order must start from 1.
- subtopic order must start from 1 for each skill.
- Use standardized technical skill names.
"""
    ),
    (
        "human",
        """
Target Role:
{job_role}

Academic Level:
{academic_level}

Year of Study:
{year_of_study}

Available Study Hours Per Day:
{study_hours_per_day}

Weak Skills:
{weak_skills}

Missing Skills:
{missing_skills}
"""
    )
])


chain = prompt | llm


def clean_json_response(content: str) -> str:
    """
    Removes accidental markdown fences from LLM output.
    """

    content = content.strip()

    if content.startswith("```json"):
        content = content[7:]

    elif content.startswith("```"):
        content = content[3:]

    if content.endswith("```"):
        content = content[:-3]

    return content.strip()


def validate_roadmap(roadmap: dict):
    """
    Basic validation before returning the generated roadmap.
    """

    if not isinstance(roadmap, dict):
        raise ValueError(
            "Roadmap response must be a JSON object."
        )

    if "ai_input" not in roadmap:
        raise ValueError(
            "Roadmap response is missing 'ai_input'."
        )

    if "roadmap" not in roadmap:
        raise ValueError(
            "Roadmap response is missing 'roadmap'."
        )

    if not isinstance(
        roadmap["roadmap"],
        list
    ):
        raise ValueError(
            "'roadmap' must be a list."
        )

    for item in roadmap["roadmap"]:

        required_fields = [
            "order",
            "skill",
            "goal",
            "estimated_hours",
            "subtopics",
            "project"
        ]

        for field in required_fields:

            if field not in item:
                raise ValueError(
                    f"Roadmap item missing '{field}'."
                )

        if not isinstance(
            item["subtopics"],
            list
        ):
            raise ValueError(
                "'subtopics' must be a list."
            )

    return roadmap


def generate_roadmap(
    job_role: str,
    weak_skills: list,
    missing_skills: list,
    academic_level: str,
    year_of_study: int,
    study_hours_per_day: float
):
    """
    Generate a personalized roadmap using Mistral.
    """

    if not job_role.strip():
        raise ValueError(
            "Target job role is required."
        )

    if study_hours_per_day <= 0:
        raise ValueError(
            "Study hours per day must be greater than 0."
        )

    if year_of_study <= 0:
        raise ValueError(
            "Year of study must be greater than 0."
        )

    response = chain.invoke({
        "job_role": job_role,

        "academic_level":
            academic_level,

        "year_of_study":
            year_of_study,

        "study_hours_per_day":
            study_hours_per_day,

        # Send valid JSON-like data to the model
        "weak_skills":
            json.dumps(
                weak_skills,
                indent=2
            ),

        "missing_skills":
            json.dumps(
                missing_skills,
                indent=2
            )
    })

    content = clean_json_response(
        response.content
    )

    if not content:
        raise ValueError(
            "Roadmap generator returned an empty response."
        )

    try:
        roadmap = json.loads(
            content
        )

    except json.JSONDecodeError as e:

        print(
            "RAW ROADMAP RESPONSE:"
        )

        print(content)

        raise ValueError(
            f"Roadmap generator returned invalid JSON: {e}"
        )

    return validate_roadmap(
        roadmap
    )