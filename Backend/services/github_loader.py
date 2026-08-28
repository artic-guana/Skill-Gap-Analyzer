# services/github_loader.py

import os
from urllib.parse import urlparse

from github import Github, GithubException
from langchain_core.documents import Document
from dotenv import load_dotenv


load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

github = (
    Github(GITHUB_TOKEN)
    if GITHUB_TOKEN
    else Github()
)


# =========================================================
# Extract owner/repository from GitHub URL
# =========================================================

def parse_github_repo_url(repo_url: str):
    """
    Convert:

    https://github.com/username/repository

    into:

    ("username", "repository")
    """

    try:
        parsed = urlparse(repo_url.strip())

        if parsed.netloc not in {
            "github.com",
            "www.github.com"
        }:
            raise ValueError(
                "URL must be a GitHub repository URL."
            )

        parts = [
            part
            for part in parsed.path.split("/")
            if part
        ]

        if len(parts) < 2:
            raise ValueError(
                "Invalid GitHub repository URL."
            )

        owner = parts[0]

        repository = parts[1]

        # Handle URLs ending with .git
        if repository.endswith(".git"):
            repository = repository[:-4]

        return owner, repository

    except ValueError:
        raise

    except Exception as e:
        raise ValueError(
            f"Invalid GitHub repository URL: {e}"
        )


# =========================================================
# Load one repository README
# =========================================================

def load_github_readme(repo_url: str):
    """
    Fetch README from a single GitHub repository.

    Returns a LangChain Document.
    """

    owner, repository = parse_github_repo_url(
        repo_url
    )

    try:
        repo = github.get_repo(
            f"{owner}/{repository}"
        )

        try:
            readme = repo.get_readme()

        except GithubException as e:

            if e.status == 404:
                raise ValueError(
                    "README not found in this repository."
                )

            raise

        readme_text = (
            readme.decoded_content.decode(
                "utf-8",
                errors="ignore"
            )
        )

        if not readme_text.strip():
            raise ValueError(
                "Repository README is empty."
            )

        return Document(
            page_content=readme_text,

            metadata={
                "owner": owner,
                "repository": repo.name,
                "repo_url": repo.html_url,
                "description":
                    repo.description or "",
                "language":
                    repo.language or "Unknown",
                "stars":
                    repo.stargazers_count,
                "forks":
                    repo.forks_count,
                "type":
                    "github_readme"
            }
        )

    except ValueError:
        raise

    except GithubException as e:

        if e.status == 404:
            raise ValueError(
                "GitHub repository not found "
                "or repository is private."
            )

        if e.status == 403:
            raise ValueError(
                "GitHub API rate limit exceeded."
            )

        raise ValueError(
            f"Failed to fetch repository: {e}"
        )


# =========================================================
# Load all repositories for user
# =========================================================

def load_user_repositories(
    username: str
):
    """
    Fetch README files from all public repositories
    belonging to a GitHub user.

    Returns a list of LangChain Documents.
    """

    try:
        user = github.get_user(
            username
        )

        documents = []

        for repo in user.get_repos():

            # Ignore forks
            if repo.fork:
                continue

            try:
                readme = repo.get_readme()

                readme_text = (
                    readme.decoded_content.decode(
                        "utf-8",
                        errors="ignore"
                    )
                )

                if not readme_text.strip():
                    continue

                document = Document(
                    page_content=readme_text,

                    metadata={
                        "owner": username,
                        "repository":
                            repo.name,
                        "repo_url":
                            repo.html_url,
                        "description":
                            repo.description or "",
                        "language":
                            repo.language
                            or "Unknown",
                        "stars":
                            repo.stargazers_count,
                        "forks":
                            repo.forks_count,
                        "type":
                            "github_readme"
                    }
                )

                documents.append(
                    document
                )

            except GithubException as e:

                # README does not exist
                if e.status == 404:
                    continue

                # Rate limit
                if e.status == 403:
                    raise ValueError(
                        "GitHub API rate limit exceeded."
                    )

                raise

        return documents

    except ValueError:
        raise

    except GithubException as e:

        if e.status == 404:
            raise ValueError(
                f"GitHub user '{username}' not found."
            )

        if e.status == 403:
            raise ValueError(
                "GitHub API rate limit exceeded."
            )

        raise ValueError(
            f"Failed to fetch GitHub repositories: {e}"
        )


# =========================================================
# Combine user READMEs
# =========================================================

def github_readmes_to_text(
    username: str
):
    """
    Fetch repository READMEs and combine them
    into a single text string.
    """

    documents = load_user_repositories(
        username
    )

    return "\n\n".join(
        f"""
Repository: {doc.metadata["repository"]}
Language: {doc.metadata["language"]}
URL: {doc.metadata["repo_url"]}

{doc.page_content}
"""
        for doc in documents
    )