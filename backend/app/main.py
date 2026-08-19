"""
FastAPI entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routes import auth, student, teacher

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
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
