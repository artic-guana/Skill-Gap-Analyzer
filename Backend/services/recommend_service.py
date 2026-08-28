from langchain_core.prompts import ChatPromptTemplate
from langchain_mistralai import ChatMistralAI
from dotenv import load_dotenv
import json

load_dotenv()

from rag.retriever import get_context_text
from services.placement_stats import (
    get_branch_statistics,
    get_most_popular_role
)


llm = ChatMistralAI(
    model="mistral-small-latest",
    temperature=0
)


BRANCH_ALIASES = {
    "cse": "Computer Science Engineering",
    "computer science": "Computer Science Engineering",
    "computer science engineering": "Computer Science Engineering",

    "ece": "Electronics and Communication Engineering",
    "electronics": "Electronics and Communication Engineering",
    "electronics and communication": "Electronics and Communication Engineering",
    "electronics & communication": "Electronics and Communication Engineering",
    "electronics and communication engineering":
        "Electronics and Communication Engineering",

    "ee": "Electrical Engineering",
    "electrical": "Electrical Engineering",
    "electrical engineering": "Electrical Engineering",

    "me": "Mechanical Engineering",
    "mechanical": "Mechanical Engineering",
    "mechanical engineering": "Mechanical Engineering",

    "civil": "Civil Engineering",
    "civil engineering": "Civil Engineering",

    "mining": "Mining Engineering",
    "mining engineering": "Mining Engineering"
}


ACADEMIC_LEVEL_ALIASES = {
    "btech": "B.Tech",
    "b.tech": "B.Tech",
    "b tech": "B.Tech",
    "bachelor of technology": "B.Tech",

    "mtech": "M.Tech",
    "m.tech": "M.Tech",
    "m tech": "M.Tech",
    "master of technology": "M.Tech",

    "bsc": "B.Sc",
    "b.sc": "B.Sc",
    "b sc": "B.Sc",

    "msc": "M.Sc",
    "m.sc": "M.Sc",
    "m sc": "M.Sc",

    "phd": "PhD",
    "ph.d": "PhD",
    "doctorate": "PhD",

    "diploma": "Diploma"
}


def normalize_branch(branch: str):
    normalized = branch.strip().lower()

    return BRANCH_ALIASES.get(
        normalized,
        branch.strip()
    )


def normalize_academic_level(academic_level: str):
    normalized = academic_level.strip().lower()

    return ACADEMIC_LEVEL_ALIASES.get(
        normalized,
        academic_level.strip()
    )


prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are an AI career recommendation assistant.

You will receive:
- an engineering branch
- the user's academic level
- placement statistics, which may be empty
- optional retrieved placement context

Your job is to return suitable career roles for the user.

The recommendation must consider BOTH:
1. Engineering branch
2. Academic level

Academic-level guidance:

- For Diploma students:
  prefer technician, junior engineering, maintenance,
  CAD, manufacturing, field, and operational roles.

- For B.Tech / B.E. students:
  prefer entry-level engineering, software, core engineering,
  analytics, product, embedded, design, and graduate roles.

- For M.Tech / M.E. students:
  prefer specialized engineering, advanced design,
  R&D, semiconductor, VLSI, AI/ML, research-oriented,
  simulation, optimization, and senior technical roles
  when relevant to the branch.

- For B.Sc students:
  prefer analyst, programming, laboratory, technical support,
  junior research, data, and domain-specific roles.

- For M.Sc students:
  prefer advanced analyst, research, data science,
  scientific computing, specialist, and R&D roles.

- For PhD students:
  prioritize research scientist, R&D engineer,
  research engineer, advanced specialist,
  academic/research, and highly specialized technical roles.

These are guidelines, not absolute restrictions.
A strong role may still be recommended outside these categories
if it is highly relevant to the branch and available placement data.

If placement data is available:
- use it to identify available roles
- consider students selected, placement percentage,
  average CTC, and highest CTC
- BUT do not blindly choose the most popular role
- adjust the recommendation according to the user's academic level
- prefer a role that is both strongly supported by placement data
  and suitable for the academic level

If placement data is missing, empty, or zero:
- generate suitable career roles based on BOTH
  the engineering branch and academic level
- do NOT invent placement statistics
- give your own career recommendation in "AI Input"
- do not unnecessarily mention missing placement data
- explain why the recommended role suits the user's
  academic background and engineering branch

Return ONLY valid JSON.

The output must contain exactly two top-level fields:

{{
    "Roles": [
        {{
            "Job Role": "Embedded Systems Engineer",
            "recommended": true
        }},
        {{
            "Job Role": "VLSI Engineer",
            "recommended": false
        }}
    ],

    "AI Input":
        "Embedded Systems Engineer is recommended because it aligns well with an ECE B.Tech background and provides strong entry-level opportunities across firmware, IoT, and hardware-software integration."
}}

Rules:
- Return at least 8 distinct career paths.
- Prefer returning 8 to 12 relevant roles.
- Do not return duplicate or near-duplicate roles.
- Roles must be appropriate for the user's academic level.
- Exactly one role should normally have recommended=true.
- All remaining roles must have recommended=false.
- Never invent placement percentages, salary values, or student counts.
- If placement data exists, use it.
- Do not recommend a role only because it has the highest salary.
- Consider academic level, branch relevance,
  placement strength, and career accessibility together.
- Ensure the role list has enough variety across relevant domains
  such as core engineering, software, analytics, research,
  design, operations, product, or specialized technical roles,
  depending on the branch and academic level.
- Do not return markdown.
- Do not use JSON code fences.
- Return only JSON.
"""
    ),
    (
        "human",
        """
Branch:
{branch}

Academic Level:
{academic_level}

Placement Statistics:
{statistics}

Most Popular Role:
{popular_role}

Retrieved Context:
{context}
"""
    )
])

chain = prompt | llm


def get_placement_insight(
    branch: str,
    academic_level: str
):

    normalized_branch = normalize_branch(branch)

    normalized_academic_level = normalize_academic_level(
        academic_level
    )

    statistics = get_branch_statistics(
        normalized_branch
    )

    popular_role = None
    context = ""

    # Placement data exists
    if statistics:

        popular_role = get_most_popular_role(
            normalized_branch
        )

        context = get_context_text(
            query=(
                f"Placement information and job roles "
                f"for {normalized_branch} suitable for "
                f"{normalized_academic_level} students"
            ),
            branch=normalized_branch,
            k=20
        )

    # Placement data does NOT exist
    else:
        statistics = []

        context = (
            "No verified placement records are available "
            "for this branch in the dataset."
        )

    response = chain.invoke({
        "branch": normalized_branch,
        "academic_level": normalized_academic_level,
        "statistics": statistics,
        "popular_role": popular_role,
        "context": context
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
            "Mistral returned an empty response."
        )

    try:
        result = json.loads(content)

    except json.JSONDecodeError as e:
        raise ValueError(
            f"Mistral returned invalid JSON: {e}"
        )

    return result


if __name__ == "__main__":

    result = get_placement_insight(
        branch="ECE",
        academic_level="B.Tech"
    )

    print(json.dumps(result, indent=2))