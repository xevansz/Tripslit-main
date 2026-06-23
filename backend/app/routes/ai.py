"""AI TripBuddy chat routes."""

import logging
import uuid
from typing import cast

from fastapi import APIRouter, Depends, HTTPException
from google import genai
from google.genai import types

from app.core.config import GEMINI_API_KEY
from app.core.security import current_user
from app.db import get_db
from app.models import ChatReq, now_iso

logger = logging.getLogger(__name__)
router = APIRouter()

TRIPBUDDY_SYSTEM = (
    "You are TripBuddy, a warm, concise AI travel assistant inside the TripSplit app. "
    "You help groups plan trips, split expenses, find vendors, suggest itineraries, and provide safety tips. "
    "Keep replies under 120 words. Use friendly tone, bullet points when listing. "
    "If asked about expense splits, offer practical advice (equal vs custom). "
    "If asked about safety, mention SOS feature and emergency contacts."
)

MODEL = "gemini-2.5-flash"

# In-memeory session history
_session_cache: dict[str, list[types.Content]] = {}


async def _load_history(
    session_id: str,
    user_id: str,
    db,
) -> list[types.Content]:
    """Checks in-memory first; falls back to DB so history survives a session restart"""

    if session_id in _session_cache:
        return _session_cache[session_id]

    cursor = db.ai_messages.find(
        {"session_id": session_id, "user_id": user_id},
        {"_id": 0},
    ).sort("created_at", 1)

    records = await cursor.to_list(200)

    history: list[types.Content] = []

    for r in records:
        history.append(
            types.Content(
                role="user",
                parts=[types.Part(text=r["message"])],
            )
        )

        history.append(
            types.Content(
                role="model",
                parts=[types.Part(text=r["reply"])],
            )
        )

    _session_cache[session_id] = history
    return history


@router.post("/ai/chat")
async def ai_chat(req: ChatReq, user: dict = Depends(current_user), db=Depends(get_db)):
    if not GEMINI_API_KEY:
        return {"reply": "Hi! No API key?"}

    history = await _load_history(req.session_id, user["id"], db=db)

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        chat = client.aio.chats.create(
            model=MODEL,
            config=types.GenerateContentConfig(system_instruction=TRIPBUDDY_SYSTEM),
            history=cast(list[types.ContentOrDict], history),
        )
        response = await chat.send_message(req.message)
        reply = response.text
    except Exception as e:
        logger.exception("AI chat failed")
        raise HTTPException(500, f"AI error: {e}")

    record = {
        "id": str(uuid.uuid4()),
        "session_id": req.session_id,
        "user_id": user["id"],
        "message": req.message,
        "reply": reply,
        "created_at": now_iso(),
    }
    await db.ai_messages.insert_one(record)

    # Update in-memory cache
    history.append(
        types.Content(
            role="user",
            parts=[types.Part(text=req.message)],
        )
    )

    history.append(
        types.Content(
            role="model",
            parts=[types.Part(text=reply)],
        )
    )

    return {"reply": reply}


@router.get("/ai/history/{session_id}")
async def ai_history(
    session_id: str, user: dict = Depends(current_user), db=Depends(get_db)
):
    cursor = db.ai_messages.find(
        {"session_id": session_id, "user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", 1)
    return await cursor.to_list(200)
