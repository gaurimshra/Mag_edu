from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.routes import api

app = FastAPI(title="MagEdu Adaptive Learning")
app.include_router(api.router, prefix="/api")
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def index():
    return FileResponse("static/index.html")

