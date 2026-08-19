"""
Central configuration module.
All environment variables are loaded here — nothing is hardcoded in the app.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────────
    app_name: str = "MagEdu Adaptive Learning"
    app_version: str = "2.0.0"
    debug: bool = False

    # ── Auth ─────────────────────────────────────────────
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    # ── Supabase ─────────────────────────────────────────
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    database_url: str  # postgresql+asyncpg://...

    # ── AI / LLM ─────────────────────────────────────────
    openai_api_key: str
    gemini_api_key: str

    # Gemini model used for content generation
    gemini_model: str = "gemini-1.5-flash"

    # Embeddings model (HuggingFace via Inference API — free)
    hf_api_key: str = ""  # optional, increases HF rate limits
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dimension: int = 384  # all-MiniLM-L6-v2 outputs 384-dim vectors

    # ── RAG ──────────────────────────────────────────────
    rag_top_k: int = 5          # number of chunks to retrieve
    rag_chunk_size: int = 600   # tokens per chunk
    rag_chunk_overlap: int = 80 # token overlap between chunks

    # ── CORS ─────────────────────────────────────────────
    allowed_origins: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    # ── BKT (Bayesian Knowledge Tracing) ─────────────────
    bkt_learn_rate: float = 0.30
    bkt_slip_rate: float = 0.10
    bkt_guess_rate: float = 0.20
    mastery_threshold: float = 0.80   # >= this = mastered
    weak_threshold: float = 0.50      # < this = weak


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton — reads .env once."""
    return Settings()
