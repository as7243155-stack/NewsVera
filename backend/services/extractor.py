import requests
from bs4 import BeautifulSoup


class ExtractionError(Exception):
    """Raised when content cannot be extracted from a URL."""


def extract_url_text(url: str) -> dict:
    """
    Fetch a webpage and extract readable text.

    Returns:
        {
            "title": str,
            "text": str,
            "url": str
        }
    """

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/131.0.0.0 Safari/537.36"
        )
    }

    try:
        response = requests.get(
            url,
            headers=headers,
            timeout=15,
            allow_redirects=True,
        )
        response.raise_for_status()

    except requests.RequestException as exc:
        raise ExtractionError(
            f"Could not access the URL: {exc}"
        ) from exc

    soup = BeautifulSoup(response.text, "html.parser")

    # Remove elements that normally don't contain article content.
    for element in soup(
        ["script", "style", "noscript", "nav", "footer", "header", "aside"]
    ):
        element.decompose()

    title = soup.title.get_text(strip=True) if soup.title else ""

    # Collect paragraphs because they're usually the most useful
    # representation of an article's readable text.
    paragraphs = []

    for paragraph in soup.find_all("p"):
        text = paragraph.get_text(" ", strip=True)

        if text:
            paragraphs.append(text)

    extracted_text = "\n\n".join(paragraphs)

    # Prevent extremely large webpages from being sent further
    # into the AI pipeline.
    extracted_text = extracted_text[:30000]

    if len(extracted_text.split()) < 10:
        raise ExtractionError(
            "Not enough readable article text could be extracted from this URL."
        )

    return {
        "title": title,
        "text": extracted_text,
        "url": response.url,
    }