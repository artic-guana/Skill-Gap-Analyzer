from rag.retriever import retrieve_placements

from services.placement_stats import (
    get_branch_role_percentage
)

from services.ai.model import model


def get_placement_recommendation(
    branch: str,
    target_role: str
):

    # 1. Exact statistics using Pandas
    stats = get_branch_role_percentage(
        branch,
        target_role
    )

    # 2. Semantic retrieval using ChromaDB
    docs = retrieve_placements(
        query=f"""
        Student from {branch}
        interested in {target_role}
        """,
        k=5
    )

    # 3. Convert retrieved documents into context
    context = "\n\n".join(
        f"""
{doc.page_content}

Metadata:
{doc.metadata}
"""
        for doc in docs
    )

    # 4. Give verified information to Mistral
    prompt = f"""
You are a college placement advisor.

Student Branch:
{branch}

Target Role:
{target_role}

PLACEMENT STATISTICS:

Total students represented for this branch:
{stats["total_students"]}

Students selected for this role:
{stats["role_students"]}

Percentage:
{stats["percentage"]}%

RELEVANT PLACEMENT DATA:

{context}

Give the student a concise career recommendation.

You may mention statistics such as:
"Approximately {stats["percentage"]}% of students from your branch
entered this role category."

Rules:
- Never invent statistics.
- Only use the provided placement data.
- Explain whether this role appears popular for the branch.
- Suggest relevant alternative roles when supported by the data.
"""

    response = model.invoke(prompt)

    return {
        "statistics": stats,
        "recommendation": response.content
    }   