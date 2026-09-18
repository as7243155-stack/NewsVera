import os

import requests
from dotenv import load_dotenv


load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

TAVILY_URL = "https://api.tavily.com/search"

TRUSTED_DOMAINS = [
    "reuters.com",
    "apnews.com",
    "bbc.com",
    "afp.com",
]


class SearchError(Exception):
    """Raised when Tavily search fails."""


def search_web(query: str, max_results: int = 5) -> list[dict]:
    if not TAVILY_API_KEY:
        raise SearchError("TAVILY_API_KEY is not configured.")

    payload = {
        "query": query,
        "topic": "news",
        "search_depth": "basic",
        "max_results": max_results,
        "include_answer": False,
        "include_raw_content": False,
    }

    headers = {
        "Authorization": f"Bearer {TAVILY_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(
            TAVILY_URL,
            json=payload,
            headers=headers,
            timeout=30,
        )

        response.raise_for_status()

    except requests.RequestException as exc:
        raise SearchError(
            f"Tavily search failed: {exc}"
        ) from exc

    data = response.json()

    results = []

    for item in data.get("results", []):
        results.append(
            {
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "content": item.get("content", ""),
                "score": item.get("score", 0),
                "published_date": item.get("published_date"),
            }
        )

    return results