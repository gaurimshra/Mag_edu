"""
LLM Wrapper service.
Primary: Gemini 1.5 Flash (free tier)
Fallback: OpenAI gpt-4o-mini (if Gemini fails or rate limits)
"""

import json
import httpx
from pydantic import BaseModel
from typing import TypeVar, Type

from app.core.config import get_settings

settings = get_settings()

T = TypeVar("T", bound=BaseModel)

# Gemini API Endpoint
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent"

# OpenAI API Endpoint (Fallback)
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"


async def generate_json(
    system_prompt: str,
    user_prompt: str,
    response_model: Type[T],
    temperature: float = 0.7,
) -> T:
    """
    Generate structured JSON output from the LLM.
    Attempts Gemini first, falls back to OpenAI on failure.
    """
    try:
        # Try primary: Gemini
        return await _generate_gemini(system_prompt, user_prompt, response_model, temperature)
    except Exception as e:
        print(f"[LLM] Gemini failed: {e}. Falling back to OpenAI.")
        # Fallback: OpenAI
        return await _generate_openai(system_prompt, user_prompt, response_model, temperature)


async def _generate_gemini(
    system_prompt: str,
    user_prompt: str,
    response_model: Type[T],
    temperature: float,
) -> T:
    if not settings.gemini_api_key:
        raise ValueError("Gemini API key not configured.")

    schema = response_model.model_json_schema()

    payload = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
        "generationConfig": {
            "temperature": temperature,
            "response_mime_type": "application/json",
            "response_schema": _convert_schema_for_gemini(schema),
        },
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{GEMINI_API_URL}?key={settings.gemini_api_key}",
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
        text_response = data["candidates"][0]["content"]["parts"][0]["text"]
        return response_model.model_validate_json(text_response)


async def _generate_openai(
    system_prompt: str,
    user_prompt: str,
    response_model: Type[T],
    temperature: float,
) -> T:
    if not settings.openai_api_key:
        raise ValueError("OpenAI API key not configured.")

    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature,
        "response_format": {"type": "json_object"},
    }

    # Instruct OpenAI to return JSON matching the schema
    schema_str = json.dumps(response_model.model_json_schema())
    payload["messages"][0]["content"] += f"\n\nYou MUST return a JSON object that perfectly matches this JSON schema:\n{schema_str}"

    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(OPENAI_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        text_response = data["choices"][0]["message"]["content"]
        return response_model.model_validate_json(text_response)


def _convert_schema_for_gemini(schema: dict) -> dict:
    """Recursively convert standard JSON schema to Gemini's expected format."""
    gemini_schema = {}
    if "type" in schema:
        # Gemini uses uppercase types: STRING, INTEGER, BOOLEAN, ARRAY, OBJECT
        t = schema["type"].upper()
        if t == "ARRAY":
             gemini_schema["type"] = "ARRAY"
             if "items" in schema:
                 gemini_schema["items"] = _convert_schema_for_gemini(schema["items"])
        elif t == "OBJECT":
             gemini_schema["type"] = "OBJECT"
             if "properties" in schema:
                 gemini_schema["properties"] = {
                     k: _convert_schema_for_gemini(v) for k, v in schema["properties"].items()
                 }
             if "required" in schema:
                 gemini_schema["required"] = schema["required"]
        else:
             gemini_schema["type"] = t
    return gemini_schema
