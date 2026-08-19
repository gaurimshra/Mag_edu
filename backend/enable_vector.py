import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import get_settings

settings = get_settings()

async def enable_vector_extension():
    engine = create_async_engine(settings.database_url, isolation_level="AUTOCOMMIT")
    async with engine.connect() as conn:
        print("Enabling pgvector extension if not exists...")
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        print("Done.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(enable_vector_extension())
