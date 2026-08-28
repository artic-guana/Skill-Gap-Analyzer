from bson import ObjectId

from database.mongodb import roadmap_collection


def get_explore_roadmaps(
    target_role: str | None = None,
    limit: int = 20
):
    query = {}

    if target_role:
        query["target_role"] = {
            "$regex": target_role,
            "$options": "i"
        }

    cursor = (
        roadmap_collection
        .find(
            query,
            {
                # Do not return full roadmap
                # while displaying cards
                "roadmap": 0
            }
        )
        .sort(
            "created_at",
            -1
        )
        .limit(limit)
    )

    roadmaps = []

    for roadmap in cursor:

        roadmaps.append({
            "id": str(
                roadmap["_id"]
            ),

            "target_role":
                roadmap.get(
                    "target_role",
                    "Unknown Role"
                ),

            "created_at":
                roadmap.get(
                    "created_at"
                )
        })

    return roadmaps


def get_explore_roadmap_by_id(
    roadmap_id: str
):
    try:
        object_id = ObjectId(
            roadmap_id
        )

    except Exception:
        raise ValueError(
            "Invalid roadmap ID"
        )

    roadmap = (
        roadmap_collection
        .find_one({
            "_id": object_id
        })
    )

    if not roadmap:
        raise ValueError(
            "Roadmap not found"
        )

    return {
        "id": str(
            roadmap["_id"]
        ),

        "target_role":
            roadmap.get(
                "target_role",
                "Unknown Role"
            ),

        "roadmap":
            roadmap.get(
                "roadmap",
                []
            ),

        "created_at":
            roadmap.get(
                "created_at"
            )
    }