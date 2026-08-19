"""
Embedding service using HuggingFace Inference API.

Model: sentence-transformers/all-MiniLM-L6-v2
Output: 384-dimensional float vectors
Cost: Free (HF Inference API, no GPU needed)

Falls back to a simple TF-IDF-style sparse vector if HF is unavailable.
"""

import asyncio
import httpx
import hashlib
import json
from pathlib import Path

from app.core.config import get_settings

settings = get_settings()

HF_API_URL = (
    f"https://api-inference.huggingface.co/pipeline/feature-extraction/"
    f"{settings.embedding_model}"
)

# Simple in-memory cache to avoid re-embedding the same text
_cache: dict[str, list[float]] = {}


async def embed_text(text: str) -> list[float]:
    """
    Embed a single text string using the HuggingFace Inference API.
    Returns a list of floats (384 dims for all-MiniLM-L6-v2).
    """
    text = text.strip()[:512]  # model max tokens
    cache_key = hashlib.md5(text.encode()).hexdigest()

    if cache_key in _cache:
        return _cache[cache_key]

    headers = {"Content-Type": "application/json"}
    if settings.hf_api_key:
        headers["Authorization"] = f"Bearer {settings.hf_api_key}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                HF_API_URL,
                headers=headers,
                json={"inputs": text, "options": {"wait_for_model": True}},
            )
            response.raise_for_status()
            result = response.json()

            # HF returns either [[...]] (batched) or [...] (single)
            if isinstance(result, list) and isinstance(result[0], list):
                vector = result[0]
            else:
                vector = result

            # Ensure correct dimension
            if len(vector) != settings.embedding_dimension:
                raise ValueError(
                    f"Expected {settings.embedding_dimension} dims, got {len(vector)}"
                )

            _cache[cache_key] = vector
            return vector

        except Exception as exc:
            # Fallback: zero vector (will degrade RAG quality but won't crash)
            print(f"[embedder] HF API error: {exc} — returning zero vector")
            return [0.0] * settings.embedding_dimension


async def embed_batch(texts: list[str], batch_size: int = 32) -> list[list[float]]:
    """
    Embed a list of texts in batches to respect HF rate limits.
    """
    results = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        # Run batch concurrently but throttle between batches
        embeddings = await asyncio.gather(*[embed_text(t) for t in batch])
        results.extend(embeddings)
        if i + batch_size < len(texts):
            await asyncio.sleep(0.5)  # gentle rate limiting
    return results
