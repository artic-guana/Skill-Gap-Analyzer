SKILL_ALIASES = {
    "js":"javascript",
    "reactjs":"react",
    "node":"node.js",
    "nodejs":"node.js",
    "mongo":"mongodb",
    "sklearn":"scikit-learn",
    "dsa":"data structures and algorithms",
    "dp":"dynamic programming",
    "dfs":"depth first search",
    "dfs and similar":"depth first search",
    "bs":"binary search",
}


def normalize_skill(skill: str):
    skill = skill.strip().lower()

    return SKILL_ALIASES.get(
        skill,
        skill
    )


def get_level(score: int):

    if score <= 20:
        return "Beginner"

    if score <= 40:
        return "Basic"

    if score <= 60:
        return "Intermediate"

    if score <= 80:
        return "Advanced"

    return "Expert"


def topic_to_score(solved_count: int):

    if solved_count <= 2:
        return 20

    if solved_count <= 5:
        return 35

    if solved_count <= 10:
        return 50

    if solved_count <= 20:
        return 65

    if solved_count <= 40:
        return 80

    return 90


def compare_skills(
    user_assessment: list,
    required_skills: list,
    cp_analysis: dict | None = None
):

    user_skill_map = {}

    # Resume + GitHub skills
    for item in user_assessment:

        normalized = normalize_skill(
            item["skill"]
        )

        user_skill_map[normalized] = {
            **item,
            "source": "resume_github"
        }

    # Codeforces / competitive programming
    if cp_analysis:

        dsa_score = cp_analysis.get(
            "dsa_score"
        )

        if dsa_score is not None:

            user_skill_map[
                "data structures and algorithms"
            ] = {
                "skill": "Data Structures and Algorithms",
                "score": dsa_score,
                "level": get_level(dsa_score),
                "source": "competitive_programming",
                "evidence": [
                    f'{cp_analysis.get("total_solved", 0)} problems solved'
                ]
            }

        topics = cp_analysis.get(
            "topics",
            {}
        )

        for topic, solved in topics.items():

            score = topic_to_score(
                solved
            )

            normalized = normalize_skill(
                topic
            )

            user_skill_map[normalized] = {
                "skill": topic.title(),
                "score": score,
                "level": get_level(score),
                "source": "competitive_programming",
                "evidence": [
                    f"{solved} problems solved in {topic}"
                ]
            }

    matched = []
    weak = []
    missing = []

    total_required_score = 0
    total_user_score = 0

    for required in required_skills:

        skill_name = required["skill"]

        normalized = normalize_skill(
            skill_name
        )

        required_score = required.get(
            "minimum_score",
            40
        )

        importance = required.get(
            "importance",
            "medium"
        )

        total_required_score += required_score

        # Missing skill
        if normalized not in user_skill_map:

            missing.append({
                "skill": skill_name,
                "required_score": required_score,
                "importance": importance,
                "gap": required_score
            })

            continue

        user_skill = user_skill_map[
            normalized
        ]

        user_score = user_skill.get(
            "score",
            0
        )

        total_user_score += min(
            user_score,
            required_score
        )

        # Matched
        if user_score >= required_score:

            matched.append({
                "skill": skill_name,
                "user_score": user_score,
                "required_score": required_score,
                "level": user_skill.get("level"),
                "source": user_skill.get("source"),
                "evidence": user_skill.get(
                    "evidence",
                    []
                )
            })

        # Weak
        else:

            weak.append({
                "skill": skill_name,
                "user_score": user_score,
                "required_score": required_score,
                "gap": required_score - user_score,
                "importance": importance,
                "level": user_skill.get("level"),
                "source": user_skill.get("source"),
                "evidence": user_skill.get(
                    "evidence",
                    []
                )
            })

    readiness_score = 0

    if total_required_score > 0:

        readiness_score = round(
            (
                total_user_score
                / total_required_score
            ) * 100,
            2
        )

    weak.sort(
        key=lambda x: x["gap"],
        reverse=True
    )

    missing.sort(
        key=lambda x: (
            x["importance"] != "high",
            -x["gap"]
        )
    )

    return {
        "readiness_score": readiness_score,

        "matched_skills": matched,

        "weak_skills": weak,

        "missing_skills": missing,

        "summary": {
            "matched": len(matched),
            "weak": len(weak),
            "missing": len(missing),
            "total_required": len(required_skills)
        }
    }