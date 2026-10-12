"""
RAG retrieval service.

Given a student query (skill + difficulty + context), this module:
1. Embeds the query via HuggingFace
2. Runs pgvector cosine similarity search on content_chunks
3. Pre-filters by subject/grade/skill_id for precision
4. Re-ranks results by difficulty fit
5. Returns top-k chunks as context for the LLM
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

from app.models.content import ContentChunk
from app.services.rag.embedder import embed_text
from app.core.config import get_settings

settings = get_settings()


def _build_query_string(skill_id: str, skill_name: str, difficulty: str, grade: int) -> str:
    """Construct a rich natural-language query for embedding."""
    return (
        f"Class {grade} Science {skill_name} {difficulty} explanation concept "
        f"NCERT chapter {skill_id.split('.')[0] if '.' in skill_id else ''}"
    )


async def retrieve_chunks(
    db: AsyncSession,
    skill_id: str,
    skill_name: str,
    difficulty: str,
    grade: int = 10,
    subject: str = "Science",
    top_k: int | None = None,
) -> list[ContentChunk]:
    """
    Retrieve the most relevant content chunks for a student request.

    Strategy:
    - Embed a rich query string
    - Use pgvector <=> operator (cosine distance) with a pre-filter
    - Re-rank by difficulty fit to avoid giving hard content to struggling students
    """
    k = top_k or settings.rag_top_k
    query_text = _build_query_string(skill_id, skill_name, difficulty, grade)
    query_embedding = await embed_text(query_text)

    dialect_name = db.bind.dialect.name if db.bind else "sqlite"

    if dialect_name == "postgresql":
        # pgvector cosine similarity via raw SQL
        embedding_str = "[" + ",".join(str(v) for v in query_embedding) + "]"

        stmt = text("""
            SELECT id, body, topic, chapter_title, difficulty, content_type, source_file
            FROM content_chunks
            WHERE subject = :subject
              AND grade = :grade
              AND (skill_id = :skill_id OR skill_id IS NULL)
            ORDER BY embedding <=> CAST(:embedding AS vector)
            LIMIT :limit
        """)

        result = await db.execute(
            stmt,
            {
                "subject": subject,
                "grade": grade,
                "skill_id": skill_id,
                "embedding": embedding_str,
                "limit": k * 3,  # over-fetch then re-rank
            },
        )
        rows = [dict(r) for r in result.mappings().all()]

        if not rows:
            stmt_fallback = text("""
                SELECT id, body, topic, chapter_title, difficulty, content_type, source_file
                FROM content_chunks
                WHERE subject = :subject AND grade = :grade
                ORDER BY embedding <=> CAST(:embedding AS vector)
                LIMIT :limit
            """)
            result = await db.execute(
                stmt_fallback,
                {"subject": subject, "grade": grade, "embedding": embedding_str, "limit": k},
            )
            rows = [dict(r) for r in result.mappings().all()]
    else:
        # SQLite / MySQL fallback: fetch candidates and compute cosine similarity in Python
        from sqlalchemy import or_
        import json

        stmt = select(ContentChunk).where(
            ContentChunk.subject == subject,
            ContentChunk.grade == grade,
            or_(ContentChunk.skill_id == skill_id, ContentChunk.skill_id.is_(None))
        )
        result = await db.execute(stmt)
        candidates = result.scalars().all()

        if not candidates:
            stmt_fallback = select(ContentChunk).where(
                ContentChunk.subject == subject,
                ContentChunk.grade == grade
            ).limit(k * 10)
            result = await db.execute(stmt_fallback)
            candidates = result.scalars().all()

        def cosine_sim(v1, v2):
            if not v1 or not v2:
                return 0.0
            if isinstance(v1, str):
                try:
                    v1 = json.loads(v1)
                except Exception:
                    return 0.0
            dot = sum(a * b for a, b in zip(v1, v2))
            norm1 = sum(a * a for a in v1) ** 0.5
            norm2 = sum(b * b for b in v2) ** 0.5
            return dot / (norm1 * norm2) if (norm1 and norm2) else 0.0

        scored_candidates = []
        for c in candidates:
            score = cosine_sim(c.embedding, query_embedding) if c.embedding else 0.0
            scored_candidates.append((score, {
                "id": c.id,
                "body": c.body,
                "topic": c.topic,
                "chapter_title": c.chapter_title,
                "difficulty": c.difficulty,
                "content_type": c.content_type,
                "source_file": c.source_file
            }))

        scored_candidates.sort(key=lambda x: x[0], reverse=True)
        rows = [item[1] for item in scored_candidates[:k * 3]]

    # Re-rank: prefer chunks whose difficulty matches the student's level
    difficulty_order = {"easy": 0, "medium": 1, "hard": 2}
    target_order = difficulty_order.get(difficulty, 1)

    def rerank_score(row) -> float:
        diff_match = 1 - abs(difficulty_order.get(row.get("difficulty", "medium"), 1) - target_order) * 0.3
        return diff_match

    ranked = sorted(rows, key=rerank_score, reverse=True)[:k]
    return ranked


def format_chunks_as_context(chunks: list) -> tuple[str, list[str]]:
    """
    Format retrieved chunks into a context string for LLM injection,
    and return source titles for citation display.
    """
    context_parts = []
    sources = []
    for i, chunk in enumerate(chunks, 1):
        title = chunk.get("topic") or chunk.get("chapter_title") or f"Source {i}"
        context_parts.append(f"[{i}] {title}:\n{chunk['body']}")
        sources.append(title)

    return "\n\n".join(context_parts), sources
