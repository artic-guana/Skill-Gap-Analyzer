import pandas as pd
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

DATA_FILE = DATA_DIR / "branch_job_roles_ctc.csv"


# Load dataset
df = pd.read_csv(DATA_FILE)


# Total placements for each branch
total_placement = (
    df.groupby("B.Tech Branch")["Students Selected"]
    .sum()
    .to_dict()
)


def placement_rate(row):
    branch = row["B.Tech Branch"]

    total = total_placement.get(branch, 0)

    if total == 0:
        return 0

    return (
        row["Students Selected"] / total
    ) * 100


# Create new feature
df["Placement Percentage"] = df.apply(
    placement_rate,
    axis=1
)


def get_branch_statistics(branch: str):
    """
    Returns placement statistics for a particular branch.
    """

    branch_df = df[
        df["B.Tech Branch"] == branch
    ].copy()

    if branch_df.empty:
        return []

    results = []

    for _, row in branch_df.iterrows():

        results.append({
            "branch": row["B.Tech Branch"],

            "job_role": row["Job Role Category"],

            "students_selected": int(
                row["Students Selected"]
            ),

            "placement_percentage": round(
                row["Placement Percentage"],
                2
            ),

            "average_ctc": float(
                row["Average CTC (LPA)"]
            ),

            "highest_ctc": float(
                row["Highest CTC (LPA)"]
            )
        })

    return results


def get_most_popular_role(branch: str):
    """
    Returns the most selected job role for a branch.
    """

    branch_df = df[
        df["B.Tech Branch"] == branch
    ]

    if branch_df.empty:
        return None

    row = branch_df.loc[
        branch_df["Students Selected"].idxmax()
    ]

    return {
        "branch": branch,

        "job_role": row["Job Role Category"],

        "students_selected": int(
            row["Students Selected"]
        ),

        "placement_percentage": round(
            row["Placement Percentage"],
            2
        ),

        "average_ctc": float(
            row["Average CTC (LPA)"]
        ),

        "highest_ctc": float(
            row["Highest CTC (LPA)"]
        )
    }


if __name__ == "__main__":

    branch = "Computer Science Engineering"

    statistics = get_branch_statistics(branch)

    for stat in statistics:
        print(stat)

    print("\nMost popular role:")

    print(
        get_most_popular_role(branch)
    )