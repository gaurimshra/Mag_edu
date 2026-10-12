"""
FastAPI entry point.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.init_db import init_db
from app.routes import auth, student, teacher

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-initialize database tables and demo seed
    try:
        await init_db()
        print("Database initialized and verified successfully.")
    except Exception as e:
        print(f"Warning: Database initialization encountered an error: {e}")
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(student.router)
app.include_router(teacher.router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": settings.app_version}
