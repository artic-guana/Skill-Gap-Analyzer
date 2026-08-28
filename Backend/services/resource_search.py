import os
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import lru_cache

from ddgs import DDGS
from dotenv import load_dotenv
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

YOUTUBE_QUOTA_EXCEEDED = False
quota_lock = threading.Lock()


@lru_cache(maxsize=500)
def search_articles(query: str, limit: int = 2):

    if not query:
        return []

    try:
        results = DDGS().text(
            query,
            max_results=limit
        )

        return [
            {
                "type": "article",
                "title": result.get("title", "Article"),
                "url": result.get("href"),
                "description": result.get("body", "")
            }
            for result in results or []
            if result.get("href")
        ]

    except Exception as e:
        print("Article search failed:", query, repr(e))
        return []


@lru_cache(maxsize=500)
def search_youtube(query: str, limit: int = 2):

    global YOUTUBE_QUOTA_EXCEEDED

    if not query or not YOUTUBE_API_KEY:
        return []

    with quota_lock:
        if YOUTUBE_QUOTA_EXCEEDED:
            return []

    try:
        youtube = build(
            "youtube",
            "v3",
            developerKey=YOUTUBE_API_KEY,
            cache_discovery=False
        )

        response = youtube.search().list(
            part="snippet",
            q=query,
            type="video",
            maxResults=limit
        ).execute()

        videos = []

        for item in response.get("items", []):

            video_id = item.get(
                "id",
                {}
            ).get("videoId")

            if not video_id:
                continue

            snippet = item.get("snippet", {})

            videos.append({
                "type": "video",
                "title": snippet.get(
                    "title",
                    "YouTube Video"
                ),
                "channel": snippet.get(
                    "channelTitle",
                    ""
                ),
                "url": (
                    f"https://www.youtube.com/"
                    f"watch?v={video_id}"
                )
            })

        return videos

    except HttpError as e:

        # YouTube quota errors are commonly 403 too,
        # not only 429.
        if e.resp.status in (403, 429):

            with quota_lock:
                YOUTUBE_QUOTA_EXCEEDED = True

            print("YouTube quota/API limit reached.")

        else:
            print("YouTube API error:", repr(e))

        return []

    except Exception as e:
        print("YouTube search failed:", repr(e))
        return []


def attach_resources(
    roadmap: dict,
    academic_level: str,
    year_of_study: int,
    study_hours_per_day: float
):

    if not isinstance(roadmap, dict):
        return roadmap

    subtopics = []

    for skill in roadmap.get("roadmap", []):
        for subtopic in skill.get("subtopics", []):
            subtopics.append(subtopic)

    tasks = {}

    with ThreadPoolExecutor(max_workers=12) as executor:

        for subtopic in subtopics:

            article_query = subtopic.get(
                "article_query",
                ""
            )

            video_query = subtopic.get(
                "video_query",
                ""
            )

            # Add student context to search queries
            context = (
                f"{academic_level} "
                f"year {year_of_study} student "
            )

            if study_hours_per_day <= 1:
                difficulty_context = "beginner concise tutorial"
            elif study_hours_per_day <= 3:
                difficulty_context = "structured tutorial"
            else:
                difficulty_context = "detailed comprehensive tutorial"

            if article_query:
                article_query = (
                    f"{article_query} "
                    f"{context} "
                    f"{difficulty_context}"
                )

            if video_query:
                video_query = (
                    f"{video_query} "
                    f"{context} "
                    f"{difficulty_context}"
                )

            subtopic["_articles"] = []
            subtopic["_videos"] = []

            if article_query:

                future = executor.submit(
                    search_articles,
                    article_query,
                    2
                )

                tasks[future] = (
                    subtopic,
                    "articles"
                )

            if video_query:

                future = executor.submit(
                    search_youtube,
                    video_query,
                    2
                )

                tasks[future] = (
                    subtopic,
                    "videos"
                )

        for future in as_completed(tasks):

            subtopic, resource_type = tasks[future]

            try:
                result = future.result()

            except Exception as e:
                print(
                    "Resource task failed:",
                    e
                )
                result = []

            if resource_type == "articles":
                subtopic["_articles"] = result

            else:
                subtopic["_videos"] = result

    for subtopic in subtopics:

        articles = subtopic.pop(
            "_articles",
            []
        )

        videos = subtopic.pop(
            "_videos",
            []
        )

        subtopic["resources"] = (
            articles + videos
        )

        subtopic["resource_status"] = {
            "articles_found": len(articles),
            "videos_found": len(videos)
        }

        subtopic.pop(
            "article_query",
            None
        )

        subtopic.pop(
            "video_query",
            None
        )

    return roadmap