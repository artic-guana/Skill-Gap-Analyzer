# services/skill_extractor.py

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
You are a technical skill extraction system.

Extract technical skills that are supported by the provided
resume and GitHub project evidence.

Extract:
- Programming languages
- Frameworks
- Libraries
- Databases
- Cloud platforms
- DevOps tools
- Machine learning technologies
- Frontend technologies
- Backend technologies
- APIs and development tools

Normalize equivalent technology names.

Examples:
JS -> JavaScript
Node -> Node.js
ReactJS -> React
sklearn -> scikit-learn
Mongo -> MongoDB

Return ONLY valid JSON in exactly this format:

{{
    "skills": [
        "Python",
        "React",
        "FastAPI"
    ]
}}

Rules:
- Return only JSON.
- Do not use markdown code fences.
- Do not add text before or after the JSON.
- Do not invent skills.
- Do not include soft skills.
- Do not include job titles.
- Remove duplicates.
- Use standardized technology names.
- Every skill must have evidence in the supplied content.
"""
    ),
    (
        "human",
        """
Resume:

{resume}

GitHub Projects:

{github_projects}
"""
    )
])


chain = prompt | llm


def extract_skills(
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
        "resume": resume_text,
        "github_projects": github_text
    })

    content = response.content.strip()

    # Helpful while debugging
    print("RAW SKILL EXTRACTOR RESPONSE:")
    print(content)

    if not content:
        raise ValueError(
            "Skill extractor returned an empty response."
        )

    # Remove markdown fences if Mistral adds them
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
            f"Skill extractor returned invalid JSON: {e}"
        )

    if "skills" not in result:
        raise ValueError(
            "Skill extractor response does not contain 'skills'."
        )

    if not isinstance(result["skills"], list):
        raise ValueError(
            "'skills' must be a list."
        )

    return result["skills"]