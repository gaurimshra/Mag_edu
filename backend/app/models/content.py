"""
Content chunk model for pgvector RAG storage.
Stores embedded NCERT chapter chunks alongside their metadata.
"""

import json
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.types import TypeDecorator

from app.core.config import get_settings
from app.core.database import Base

settings = get_settings()


class VectorType(TypeDecorator):
    """
    Transparent vector type:
    - On PostgreSQL with pgvector: maps to pgvector Vector(dim)
    - On SQLite or MySQL: maps to Text containing JSON array of floats
    """
    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            try:
                from pgvector.sqlalchemy import Vector
                return dialect.type_descriptor(Vector(settings.embedding_dimension))
            except Exception:
                return dialect.type_descriptor(Text())
        return dialect.type_descriptor(Text())

    def process_bind_param(self, value, dialect):
        if dialect.name == "postgresql":
            return value
        if value is not None:
            if isinstance(value, str):
                return value
            return json.dumps(value)
        return None

    def process_result_value(self, value, dialect):
        if dialect.name == "postgresql":
            return value
        if value is not None:
            if isinstance(value, list):
                return value
            try:
                return json.loads(value)
            except Exception:
                return value
        return None


class ContentChunk(Base):
    """
    One embedded chunk from an NCERT chapter.
    The 'embedding' column is a pgvector vector on PostgreSQL,
    or a JSON-serialized vector string on SQLite/MySQL.

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
    embedding = Column(VectorType, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
