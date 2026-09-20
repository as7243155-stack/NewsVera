import os
import re
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from urllib.parse import urlparse

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


FACT_CHECK_DOMAINS = [
    "factcheck.afp.com",
    "reuters.com",
    "apnews.com",
    "bbc.com",
]


class SearchError(Exception):
    """Raised when Tavily search fails."""


# ---------------------------------------------------------
# TAVILY SEARCH
# ---------------------------------------------------------

def _tavily_search(
    query: str,
    max_results: int = 5,
    domains: list[str] | None = None,
) -> list[dict]:
    if not TAVILY_API_KEY:
        raise SearchError(
            "TAVILY_API_KEY is not configured."
        )

    payload = {
        "query": query,
        "topic": "news",
        "search_depth": "basic",
        "max_results": max_results,
        "include_answer": False,
        "include_raw_content": False,
    }

    if domains:
        payload["include_domains"] = domains

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

    try:
        data = response.json()

    except ValueError as exc:
        raise SearchError(
            "Tavily returned an invalid response."
        ) from exc

    results = []

    for item in data.get("results", []):
        results.append(
            {
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "content": item.get("content", ""),
                "score": item.get("score", 0),
                "published_date": item.get(
                    "published_date"
                ),
            }
        )

    return results


def search_web(
    query: str,
    max_results: int = 5,
) -> list[dict]:
    return _tavily_search(
        query=query,
        max_results=max_results,
    )


# ---------------------------------------------------------
# DATE HELPERS
# ---------------------------------------------------------

def _parse_published_date(
    value: str | None,
) -> datetime | None:
    if not value:
        return None

    # ISO 8601:
    # 2026-09-18T13:47:36Z
    try:
        parsed = datetime.fromisoformat(
            value.replace("Z", "+00:00")
        )

        if parsed.tzinfo is None:
            parsed = parsed.replace(
                tzinfo=timezone.utc
            )

        return parsed.astimezone(timezone.utc)

    except ValueError:
        pass

    # RFC 2822:
    # Fri, 18 Sep 2026 13:47:36 GMT
    try:
        parsed = parsedate_to_datetime(value)

        if parsed.tzinfo is None:
            parsed = parsed.replace(
                tzinfo=timezone.utc
            )

        return parsed.astimezone(timezone.utc)

    except (TypeError, ValueError):
        return None


def _is_recent(
    result: dict,
    days: int = 14,
) -> bool:
    published = _parse_published_date(
        result.get("published_date")
    )

    if not published:
        return False

    now = datetime.now(timezone.utc)

    minimum_date = now - timedelta(days=days)

    return minimum_date <= published <= now


def _format_date(
    value: str | None,
) -> str:
    parsed = _parse_published_date(value)

    if not parsed:
        return datetime.now(
            timezone.utc
        ).strftime("%b %d, %Y")

    return parsed.strftime("%b %d, %Y")


# ---------------------------------------------------------
# SOURCE HELPERS
# ---------------------------------------------------------

def _source_name(url: str) -> str:
    url_lower = url.lower()

    if "reuters.com" in url_lower:
        return "Reuters"

    if "apnews.com" in url_lower:
        return "Associated Press"

    if "bbc.com" in url_lower:
        return "BBC News"

    if (
        "afp.com" in url_lower
        or "factcheck.afp.com" in url_lower
    ):
        return "AFP Fact Check"

    return "News Source"


# ---------------------------------------------------------
# ARTICLE FILTERING
# ---------------------------------------------------------

def _is_article_page(
    result: dict,
) -> bool:
    title = (
        result.get("title", "")
        .strip()
        .lower()
    )

    url = (
        result.get("url", "")
        .strip()
        .lower()
    )

    # These usually indicate section/home pages
    # rather than individual articles.
    generic_title_patterns = [
        "latest news & updates",
        "news homepage",
        "news and updates",
        "latest headlines",
        "news headlines",
        "homepage",
        "home |",
        "all news",
    ]

    if any(
        pattern in title
        for pattern in generic_title_patterns
    ):
        return False

    parsed = urlparse(url)

    if not parsed.netloc:
        return False

    if not parsed.path.strip("/"):
        return False

    return True


# ---------------------------------------------------------
# SUMMARY / CATEGORY
# ---------------------------------------------------------

def _clean_summary(
    content: str,
) -> str:
    # Remove line breaks and repeated whitespace.
    text = re.sub(
        r"\s+",
        " ",
        content,
    ).strip()

    if not text:
        return ""

    if len(text) > 220:
        text = (
            text[:217]
            .rsplit(" ", 1)[0]
            + "..."
        )

    return text


def _category_from_text(
    title: str,
    content: str,
) -> str:
    # The headline gets priority over the
    # search-result snippet.

    title_text = title.lower()

    if any(
        word in title_text
        for word in [
            "election",
            "government",
            "president",
            "parliament",
            "minister",
            "politics",
            "vote",
            "voting",
        ]
    ):
        return "Politics"

    if any(
        word in title_text
        for word in [
            "climate",
            "warming",
            "emissions",
            "renewable",
            "carbon",
            "environment",
        ]
    ):
        return "Climate"

    if any(
        word in title_text
        for word in [
            "science",
            "research",
            "researchers",
            "scientists",
            "study",
            "discovery",
        ]
    ):
        return "Science"

    if any(
        word in title_text
        for word in [
            "technology",
            "artificial intelligence",
            "ai",
            "cyber",
            "software",
        ]
    ):
        return "Technology"

    if any(
        word in title_text
        for word in [
            "business",
            "economy",
            "market",
            "company",
            "trade",
            "finance",
        ]
    ):
        return "Business"

    if any(
        word in title_text
        for word in [
            "health",
            "hospital",
            "medical",
            "medicine",
            "disease",
        ]
    ):
        return "Health"

    if any(
        word in title_text
        for word in [
            "sport",
            "football",
            "cricket",
            "tennis",
            "basketball",
        ]
    ):
        return "Sports"

    return "World"


# ---------------------------------------------------------
# FACT-CHECK DETECTION
# ---------------------------------------------------------

def _is_debunking_story(
    result: dict,
) -> bool:
    text = (
        f"{result.get('title', '')} "
        f"{result.get('content', '')}"
    ).lower()

    indicators = [
        "debunk",
        "false",
        "misleading",
        "fact check",
        "fact-check",
        "incorrect",
        "fake",
        "false claim",
        "no evidence",
        "does not show",
        "not true",
        "wrong",
    ]

    return any(
        indicator in text
        for indicator in indicators
    )


# ---------------------------------------------------------
# NEWS STORY BUILDER
# ---------------------------------------------------------

def _build_story(
    result: dict,
    story_id: int,
    status: str,
    tone: str,
) -> dict:
    title = (
        result.get("title", "")
        .strip()
    )

    content = (
        result.get("content", "")
        .strip()
    )

    return {
        "id": story_id,
        "title": title,
        "summary": _clean_summary(
            content
        ),
        "category": _category_from_text(
            title,
            content,
        ),
        "date": _format_date(
            result.get("published_date")
        ),
        "source": _source_name(
            result.get("url", "")
        ),
        "status": status,
        "score": (
            90
            if tone == "real"
            else 20
        ),
        "tone": tone,
    }


# ---------------------------------------------------------
# LIVE NEWS FEED
# ---------------------------------------------------------

def get_news_feed() -> dict:
    # Search reputable news sources.
    real_results = _tavily_search(
        query="latest important news today",
        max_results=6,
        domains=TRUSTED_DOMAINS,
    )

    # Search specifically for fact-checking /
    # debunking stories.
    fact_check_results = _tavily_search(
        query=(
            "latest fact checks "
            "debunked false misleading claims"
        ),
        max_results=6,
        domains=FACT_CHECK_DOMAINS,
    )

    stories = []

    # -----------------------------------------------------
    # REAL NEWS
    # -----------------------------------------------------

    story_id = 1

    for result in real_results:
        if not result.get("title"):
            continue

        if not _is_recent(result):
            continue

        if not _is_article_page(result):
            continue

        stories.append(
            _build_story(
                result=result,
                story_id=story_id,
                status="Verified",
                tone="real",
            )
        )

        story_id += 1

        if story_id > 6:
            break

    # -----------------------------------------------------
    # DEBUNKED / MISLEADING NEWS
    # -----------------------------------------------------

    next_id = len(stories) + 1

    for result in fact_check_results:
        if not result.get("title"):
            continue

        if not _is_recent(result):
            continue

        if not _is_article_page(result):
            continue

        if not _is_debunking_story(result):
            continue

        stories.append(
            _build_story(
                result=result,
                story_id=next_id,
                status="Debunked",
                tone="false",
            )
        )

        next_id += 1

        if next_id > 10:
            break

    return {
        "success": True,
        "stories": stories,
    }