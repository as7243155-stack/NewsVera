from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.extractor import ExtractionError, extract_url_text
from services.search import (
    SearchError,
    get_news_feed,
    search_web,
)
from services.verifier import VerificationError, verify_claim
from services.link_checker import LinkCheckError, check_link


app = FastAPI(
    title="NewsVera Verification API",
    description="AI-powered news verification backend",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VerifyRequest(BaseModel):
    mode: Literal["text", "url"]
    content: str = Field(min_length=1, max_length=30000)

class SearchRequest(BaseModel):
    query: str = Field(min_length=3, max_length=500)

class AnalyzeRequest(BaseModel):
    claim: str = Field(min_length=10, max_length=10000)

class LinkCheckRequest(BaseModel):
    url: str = Field(min_length=1, max_length=2048)

@app.post("/analyze")
def analyze(request: AnalyzeRequest):
    try:
        search_results = search_web(request.claim, max_results=5)

        verification = verify_claim(
            request.claim,
            search_results,
        )

        return {
            "success": True,
            "claim": request.claim,
            "verification": verification,
            "sources": search_results,
        }

    except SearchError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    except VerificationError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

@app.post("/search")
def search(request: SearchRequest):
    try:
        results = search_web(request.query)

        return {
            "success": True,
            "query": request.query,
            "results": results,
        }

    except SearchError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc


@app.get("/")
def root():
    return {
        "message": "NewsVera Verification API is running",
        "status": "ok",
    }

@app.get("/news")
def news():
    try:
        return get_news_feed()
    except SearchError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "NewsVera backend",
    }

@app.post("/check-link")
def check_link_endpoint(request: LinkCheckRequest):
    try:
        result = check_link(request.url)
        return result

    except LinkCheckError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

@app.post("/verify")
def verify(request: VerifyRequest):
    search_query = ""
    if request.mode == "text":
        words = request.content.split()

        if len(words) < 10:
            raise HTTPException(
                status_code=400,
                detail="Text must contain at least 10 words.",
            )

        claim_text = request.content.strip()

    elif request.mode == "url":
        try:
            extracted = extract_url_text(
                request.content.strip()
            )

            claim_text = extracted["text"]

            # Use a short query for web search instead of
            # sending the entire extracted article to Tavily.
            article_title = extracted.get("title", "").strip()

            first_paragraph = (
                claim_text.split("\n\n")[0].strip()
                if claim_text
                else ""
            )

            search_query = (
                f"{article_title} {first_paragraph}"
            ).strip()[:1000]

        except ExtractionError as exc:
            raise HTTPException(
                status_code=400,
                detail=str(exc),
            ) from exc

    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported verification mode.",
        )

    try:
        search_query = (
            search_query
            if request.mode == "url"
            else claim_text
        )

        search_results = search_web(
            search_query,
            max_results=5,
        )

    except SearchError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    try:
        verification = verify_claim(
            claim_text,
            search_results,
        )

    except VerificationError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    return {
        "success": True,
        "source_type": request.mode,
        "input": request.content,
        "claim": claim_text,
        "verification": verification,
        "sources": search_results,
    }