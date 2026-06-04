"""Main entry point for the TripSplit FastAPI application."""

import logging
from contextlib import asynccontextmanager

from app.db.database import _db
from app.routes import api
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app):
    # startup
    yield

    # On shutdown
    async def shutdown():
        await _db.close()


app = FastAPI(title="TripSplit API", version="1.0.0", lifespan=lifespan)

# Include all routes
app.include_router(api)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"service": "TripSplit", "status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
