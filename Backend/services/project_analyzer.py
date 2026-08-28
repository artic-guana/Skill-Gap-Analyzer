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
You are an AI software project analyzer.

Analyze the supplied GitHub project README.

Use ONLY information supported by the README.

Return ONLY valid JSON in exactly this structure:

{{
    "project_name": "Project Name",

    "summary":
        "Short explanation of what the project does.",

    "project_type":
        "Web Application",

    "technologies": [
        "React",
        "FastAPI",
        "MongoDB"
    ],

    "features": [
        "User authentication",
        "REST API integration",
        "Dashboard"
    ],

    "skills_demonstrated": [
        {{
            "skill": "React",
            "evidence":
                "React is used to build the frontend dashboard."
        }},
        {{
            "skill": "FastAPI",
            "evidence":
                "FastAPI is used for backend API development."
        }}
    ],

    "difficulty": "Intermediate",

    "score": 72,

    "ai_input":
        "The project demonstrates practical full-stack development skills through frontend, backend and database integration."
}}

Rules:

- Use only README evidence.
- Do not invent technologies.
- Do not invent features.
- Do not assume deployment unless mentioned.
- Do not assume authentication unless mentioned.
- technologies must contain technical tools only.
- features must contain implemented project features.
- skills_demonstrated must contain evidence.
- difficulty must be one of:
  "Beginner",
  "Intermediate",
  "Advanced"
- score must be an integer from 0 to 100.
- The score represents overall technical project complexity.
- Return JSON only.
- Do not return markdown.
- Do not use JSON code fences.
"""
    ),
    (
        "human",
        """
Repository:
{repository}

README:

{readme}
"""
    )
])


chain = prompt | llm


def analyze_project(
    repository: str,
    readme_text: str
):
    response = chain.invoke({
        "repository": repository,
        "readme": readme_text
    })

    content = response.content.strip()

    if content.startswith("```json"):
        content = content[7:]

    elif content.startswith("```"):
        content = content[3:]

    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    if not content:
        raise ValueError(
            "Project analyzer returned an empty response."
        )

    try:
        result = json.loads(content)

    except json.JSONDecodeError as e:
        raise ValueError(
            f"Project analyzer returned invalid JSON: {e}"
        )

    return result