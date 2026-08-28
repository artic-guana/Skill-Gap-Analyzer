import json

from langchain_core.prompts import ChatPromptTemplate
from langchain_mistralai import ChatMistralAI
from dotenv import load_dotenv

load_dotenv()


llm = ChatMistralAI(
    model="mistral-small-latest",
    temperature=0
)


prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are a technical job-role skill requirement analyzer.

Given a target job role, generate the technical skills required
to become job-ready for that role.

Return ONLY valid JSON in this exact structure:

{{
    "required_skills": [
        {{
            "skill": "Python",
            "minimum_score": 70,
            "importance": "high"
        }}
    ]
}}

Rules:
- Include only technical skills.
- Do not include soft skills.
- Use standardized skill names.
- minimum_score must be an integer from 0 to 100.
- importance must be one of:
  "high", "medium", "low".
- Include around 8-15 important skills.
- Return JSON only.
- Do not use markdown code fences.
- Do not add explanations outside the JSON.
"""
    ),
    (
        "human",
        """
Target Job Role:

{job_role}
"""
    )
])


chain = prompt | llm


def generate_required_skills(job_role: str):

    response = chain.invoke({
        "job_role": job_role
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
            "Target skill generator returned an empty response."
        )

    try:
        result = json.loads(content)

    except json.JSONDecodeError as e:
        raise ValueError(
            f"Invalid JSON returned by target skill generator: {e}"
        )

    if "required_skills" not in result:
        raise ValueError(
            "Target skill response does not contain 'required_skills'."
        )

    return result["required_skills"]