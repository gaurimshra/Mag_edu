"""
Content chunk model for pgvector RAG storage.
Stores embedded NCERT chapter chunks alongside their metadata.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.dialects.postgresql import ARRAY
from pgvector.sqlalchemy import Vector

from app.core.config import get_settings
from app.core.database import Base

settings = get_settings()


class ContentChunk(Base):
    """
    One embedded chunk from an NCERT chapter.
    The 'embedding' column is a pgvector vector for similarity search.

    Metadata fields let us filter by subject / chapter / topic before
    doing the vector search (pre-filter = faster + cheaper).
    """
    __tablename__ = "content_chunks"

    id = Column(Integer, primary_key=True, index=True)
    source_file = Column(String(300), nullable=False)           # e.g. "chapter-1.pdf"
    chapter_num = Column(Integer, nullable=True)                # 1-10
    chapter_title = Column(String(300), nullable=True)
    topic = Column(String(300), nullable=True)                  # sub-topic heading
    skill_id = Column(String(100), nullable=True, index=True)   # maps to skills table
    subject = Column(String(100), default="Science")
    grade = Column(Integer, default=10)
    difficulty = Column(String(20), default="medium")           # easy | medium | hard
    content_type = Column(String(20), default="lesson")         # lesson | exercise | example | summary
    body = Column(Text, nullable=False)
    word_count = Column(Integer, default=0)
    embedding = Column(Vector(settings.embedding_dimension))    # pgvector column
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
