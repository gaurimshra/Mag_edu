import re
from collections import Counter

from app.services.models import ContentItem, Student


def tokenize(text: str) -> Counter:
    words = re.findall(r"[a-z0-9]+", text.lower())
    return Counter(words)


def similarity(a: str, b: str) -> float:
    ca = tokenize(a)
    cb = tokenize(b)
    if not ca or not cb:
        return 0.0
    shared = set(ca) & set(cb)
    return sum(min(ca[w], cb[w]) for w in shared) / max(1, sum(ca.values()))


def retrieve(contents: list[ContentItem], skill_id: str, difficulty: str, query: str, k: int = 3) -> list[ContentItem]:
    scored = []
    for item in contents:
        score = 0.0
        if item.skill_id == skill_id:
            score += 40
        if item.difficulty == difficulty:
            score += 25
        score += similarity(query, item.title + " " + item.body) * 20
        scored.append((score, item))
    return [item for _, item in sorted(scored, key=lambda row: row[0], reverse=True)[:k]]


def generate(mode: str, topic: str, student: Student, chunks: list[ContentItem]) -> dict:
    context = " ".join(item.body for item in chunks)
    source_titles = [item.title for item in chunks]
    if mode == "quiz":
        body = f"Quick check on {topic}: {make_question(topic, context)}"
    elif mode == "exercise":
        body = (
            f"Practice set for {topic}: 1. Explain the key idea in your own words. "
            f"2. Give one example. 3. Solve one similar problem using the textbook rule."
        )
    elif mode == "simpler":
        body = f"Let's make {topic} simpler. {simple_explanation(context)}"
    else:
        body = f"{topic}: {context}"
    return {"mode": mode, "body": body, "sources": source_titles}


def simple_explanation(context: str) -> str:
    first = context.split(".")[0].strip()
    return f"{first}. Think of it as one small job in a bigger system. Focus on what it does, then why it matters."


def make_question(topic: str, context: str) -> str:
    first = context.split(".")[0].strip()
    return f"Based on this idea, '{first}', what is the most important role of {topic}?"

