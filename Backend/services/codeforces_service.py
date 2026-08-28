# services/codeforces_service.py

import requests


BASE_URL = "https://codeforces.com/api"


def get_codeforces_profile(handle: str):
    """
    Fetch basic Codeforces user profile.
    """

    if not handle:
        raise ValueError(
            "Codeforces handle is required."
        )

    try:
        response = requests.get(
            f"{BASE_URL}/user.info",
            params={
                "handles": handle
            },
            timeout=20
        )

        response.raise_for_status()

        data = response.json()

    except requests.RequestException as e:
        raise ValueError(
            f"Codeforces API request failed: {e}"
        )

    except ValueError:
        raise ValueError(
            "Invalid response received from Codeforces."
        )

    if data.get("status") != "OK":
        raise ValueError(
            data.get(
                "comment",
                "Invalid Codeforces handle."
            )
        )

    return data["result"][0]


def get_codeforces_submissions(
    handle: str
):
    """
    Fetch submissions made by a Codeforces user.
    """

    if not handle:
        raise ValueError(
            "Codeforces handle is required."
        )

    try:
        response = requests.get(
            f"{BASE_URL}/user.status",
            params={
                "handle": handle,
                "from": 1
            },
            timeout=20
        )

        response.raise_for_status()

        data = response.json()

    except requests.RequestException as e:
        raise ValueError(
            f"Codeforces API request failed: {e}"
        )

    except ValueError:
        raise ValueError(
            "Invalid response received from Codeforces."
        )

    if data.get("status") != "OK":
        raise ValueError(
            data.get(
                "comment",
                "Unable to fetch Codeforces submissions."
            )
        )

    return data.get(
        "result",
        []
    )


def calculate_dsa_score(
    total_solved: int
):
    """
    Convert total solved Codeforces problems
    into a rough DSA proficiency score.
    """

    if total_solved <= 10:
        return 20

    if total_solved <= 30:
        return 35

    if total_solved <= 60:
        return 50

    if total_solved <= 120:
        return 65

    if total_solved <= 250:
        return 80

    return 90


def analyze_codeforces_skills(
    handle: str
):
    """
    Analyze accepted Codeforces submissions.

    Returns:
    - profile information
    - total unique problems solved
    - DSA score
    - topic-wise solved problem counts
    """

    profile = get_codeforces_profile(
        handle
    )

    submissions = (
        get_codeforces_submissions(
            handle
        )
    )

    solved = set()

    topic_count = {}

    rating_sum = 0
    rated_problem_count = 0

    max_problem_rating = 0


    for submission in submissions:

        if submission.get(
            "verdict"
        ) != "OK":
            continue


        problem = submission.get(
            "problem",
            {}
        )


        problem_id = (
            problem.get("contestId"),
            problem.get("index")
        )


        if (
            problem_id[0] is None
            or problem_id[1] is None
        ):
            continue


        if problem_id in solved:
            continue


        solved.add(
            problem_id
        )


        # Topic counts
        for tag in problem.get(
            "tags",
            []
        ):

            normalized_tag = (
                tag.strip().lower()
            )

            topic_count[
                normalized_tag
            ] = (
                topic_count.get(
                    normalized_tag,
                    0
                )
                + 1
            )


        # Problem difficulty
        rating = problem.get(
            "rating"
        )

        if rating is not None:

            rating_sum += rating

            rated_problem_count += 1

            max_problem_rating = max(
                max_problem_rating,
                rating
            )


    total_solved = len(
        solved
    )


    dsa_score = (
        calculate_dsa_score(
            total_solved
        )
    )


    average_problem_rating = 0

    if rated_problem_count > 0:

        average_problem_rating = round(
            rating_sum
            / rated_problem_count,
            2
        )


    topic_count = dict(
        sorted(
            topic_count.items(),
            key=lambda item: item[1],
            reverse=True
        )
    )


    return {
        "handle":
            handle,

        "rating":
            profile.get(
                "rating"
            ),

        "max_rating":
            profile.get(
                "maxRating"
            ),

        "rank":
            profile.get(
                "rank"
            ),

        "max_rank":
            profile.get(
                "maxRank"
            ),

        "total_solved":
            total_solved,

        "dsa_score":
            dsa_score,

        "average_problem_rating":
            average_problem_rating,

        "max_problem_rating":
            max_problem_rating,

        "topics":
            topic_count
    }