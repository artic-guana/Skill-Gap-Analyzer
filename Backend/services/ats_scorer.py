import re


SECTION_KEYWORDS = (
    "summary",
    "objective",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
)

ACTION_VERBS = (
    "built",
    "created",
    "designed",
    "developed",
    "implemented",
    "improved",
    "led",
    "managed",
    "optimized",
    "automated",
)


def calculate_ats_score(resume_text: str) -> int:
    text = " ".join((resume_text or "").split())

    if not text:
        return 0

    lower_text = text.lower()
    score = 10

    word_count = len(text.split())
    if 250 <= word_count <= 900:
        score += 15
    elif 120 <= word_count <= 1200:
        score += 8

    if re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text):
        score += 8

    if re.search(r"(?:\+?\d[\d\s().-]{8,}\d)", text):
        score += 7

    section_count = sum(
        1 for keyword in SECTION_KEYWORDS
        if re.search(rf"\b{re.escape(keyword)}\b", lower_text)
    )
    score += min(section_count * 5, 30)

    action_verb_count = sum(
        len(re.findall(rf"\b{verb}\b", lower_text))
        for verb in ACTION_VERBS
    )
    score += min(action_verb_count * 2, 15)

    if re.search(r"\b\d+%|\b\d+[+]?(?:\s+)?(?:users|projects|clients|hours|days)\b", lower_text):
        score += 10

    if "linkedin.com" in lower_text or "github.com" in lower_text:
        score += 5

    return min(score, 100)