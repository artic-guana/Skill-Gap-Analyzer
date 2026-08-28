import json
import os

from github import Github
from github.GithubException import (
    GithubException,
)

from langchain_mistralai import (
    ChatMistralAI,
)

from langchain_core.prompts import (
    ChatPromptTemplate,
)

from dotenv import load_dotenv


load_dotenv()


GITHUB_TOKEN = os.getenv(
    "GITHUB_TOKEN"
)

MISTRAL_API_KEY = os.getenv(
    "MISTRAL_API_KEY"
)


github_client = Github(
    GITHUB_TOKEN
)


llm = ChatMistralAI(
    model="mistral-small-latest",
    temperature=0,
    api_key=MISTRAL_API_KEY,
)


prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are a technical project evaluator.

Analyze a GitHub repository using its README
and repository metadata.

Return ONLY valid JSON.

Required format:

{{
    "summary": "short 1-2 sentence project summary",
    "difficulty": "Beginner | Intermediate | Advanced",
    "technologies": [
        "technology"
    ],
    "skills_demonstrated": [
        "skill"
    ]
}}

Difficulty guidelines:

Beginner:
- basic CRUD
- basic frontend
- simple scripts
- tutorial-style projects
- very limited architecture

Intermediate:
- full-stack applications
- authentication
- external API integrations
- databases
- multiple major components

Advanced:
- AI/ML systems
- complex backend architecture
- distributed systems
- real-time applications
- advanced algorithms
- production-oriented systems
- sophisticated infrastructure

Do not exaggerate difficulty.

Only infer technologies or skills that have
reasonable evidence from the provided README
or repository metadata.

Keep the summary concise.
"""
        ),
        (
            "human",
            """
Repository name:
{repo_name}

Description:
{description}

Primary language:
{language}

Topics:
{topics}

README:
{readme}
"""
        ),
    ]
)


def get_readme_text(repo):
    try:

        readme = repo.get_readme()

        return (
            readme.decoded_content
            .decode(
                "utf-8",
                errors="ignore"
            )
        )

    except GithubException:

        return ""


def analyze_readme(
    repo_name: str,
    description: str,
    language: str,
    topics: list,
    readme: str,
):

    if not readme.strip():

        return {
            "summary":
                description
                or
                "No README description available.",

            "difficulty":
                "Beginner",

            "technologies":
                (
                    [language]
                    if language
                    else []
                ),

            "skills_demonstrated":
                [],
        }


    # Prevent sending huge README files
    readme = readme[:12000]


    chain = (
        prompt
        |
        llm
    )


    response = chain.invoke(
        {
            "repo_name":
                repo_name,

            "description":
                description
                or "",

            "language":
                language
                or "",

            "topics":
                ", ".join(
                    topics or []
                ),

            "readme":
                readme,
        }
    )


    content = response.content


    if isinstance(
        content,
        dict
    ):
        return content


    content = (
        content
        .replace(
            "```json",
            ""
        )
        .replace(
            "```",
            ""
        )
        .strip()
    )


    try:

        return json.loads(
            content
        )

    except json.JSONDecodeError:

        return {
            "summary":
                "Unable to generate project summary.",

            "difficulty":
                "Intermediate",

            "technologies":
                (
                    [language]
                    if language
                    else []
                ),

            "skills_demonstrated":
                [],
        }


def analyze_github_projects(
    github_username: str
):

    user = github_client.get_user(
        github_username
    )

    repos = user.get_repos()


    results = []


    for repo in repos:

        # Skip forks because they are
        # normally not the user's own project.
        if repo.fork:
            continue


        readme = get_readme_text(
            repo
        )


        analysis = analyze_readme(
            repo_name=
                repo.name,

            description=
                repo.description
                or "",

            language=
                repo.language
                or "",

            topics=
                repo.get_topics(),

            readme=
                readme,
        )


        results.append(
            {
                "repo_name":
                    repo.name,

                "repo_url":
                    repo.html_url,

                "summary":
                    analysis.get(
                        "summary",
                        ""
                    ),

                "difficulty":
                    analysis.get(
                        "difficulty",
                        "Intermediate"
                    ),

                "technologies":
                    analysis.get(
                        "technologies",
                        []
                    ),

                "skills_demonstrated":
                    analysis.get(
                        "skills_demonstrated",
                        []
                    ),

                "stars":
                    repo.stargazers_count,

                "forks":
                    repo.forks_count,
            }
        )


    return results