"""Main entry point for the TripSplit FastAPI application."""

import logging
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.routes import api
from app.db.database import _db

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(title="TripSplit API", version="1.0.0")

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


@app.on_event("shutdown")
async def shutdown():
    await _db.close()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
