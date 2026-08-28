# services/skill_assessor.py

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
You are a technical skill assessment system.

Assess the user's proficiency in each provided skill using only
the resume and GitHub project evidence supplied.

Use this scoring rubric:

0-20:
Skill is only mentioned with little or no implementation evidence.

21-40:
Basic usage in simple projects.

41-60:
Used independently in functional projects.

61-80:
Used in multiple projects or with advanced implementation such as
APIs, authentication, databases, deployment, state management,
machine learning pipelines, cloud services, or similar features.

81-100:
Strong production-level evidence involving architecture,
scalability, optimization, testing, security, complex integrations,
or advanced implementation.

Return ONLY valid JSON in this exact structure:

{{
    "skills": [
        {{
            "skill": "React",
            "score": 72,
            "level": "Advanced",
            "evidence": [
                "Used React to build a frontend dashboard",
                "Integrated REST APIs and state management"
            ],
            "ai_input": "The user demonstrates strong React proficiency through multiple functional project implementations."
        }}
    ]
}}

Rules:
- Return only JSON.
- Do not use markdown code fences.
- Do not add any text before or after the JSON.
- Assess only the supplied skills.
- Do not invent project features.
- Do not invent technologies.
- Use only evidence from the resume and GitHub projects.
- Keep evidence concise.
- Scores must be integers from 0 to 100.
- Use these levels:
  0-20 = Beginner
  21-40 = Basic
  41-60 = Intermediate
  61-80 = Advanced
  81-100 = Expert
"""
    ),
    (
        "human",
        """
Skills to assess:
{skills}

Resume:
{resume}

GitHub Projects:
{github_projects}
"""
    )
])


chain = prompt | llm


def assess_skills(
    skills: list,
    resume_text: str,
    github_documents: list
):
    github_text = "\n\n".join(
        f"""
Repository: {doc.metadata.get("repository", "Unknown")}

{doc.page_content}
"""
        for doc in github_documents
    )

    response = chain.invoke({
        "skills": skills,
        "resume": resume_text,
        "github_projects": github_text
    })

    content = response.content.strip()

    print("RAW SKILL ASSESSOR RESPONSE:")
    print(content)

    if not content:
        raise ValueError(
            "Skill assessor returned an empty response."
        )

    # Remove accidental markdown code fences
    if content.startswith("```json"):
        content = content[7:]

    elif content.startswith("```"):
        content = content[3:]

    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    try:
        result = json.loads(content)

    except json.JSONDecodeError as e:
        raise ValueError(
            f"Skill assessor returned invalid JSON: {e}"
        )

    if "skills" not in result:
        raise ValueError(
            "Skill assessor JSON does not contain 'skills'."
        )

    return result