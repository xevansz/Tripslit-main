"""AI TripBuddy chat routes."""

import uuid
import logging
from fastapi import APIRouter, HTTPException, Depends
from app.models import ChatReq, now_iso
from app.core import current_user, EMERGENT_LLM_KEY
from app.db import get_db

logger = logging.getLogger(__name__)
router = APIRouter()

TRIPBUDDY_SYSTEM = (
    "You are TripBuddy, a warm, concise AI travel assistant inside the TripSplit app. "
    "You help groups plan trips, split expenses, find vendors, suggest itineraries, and provide safety tips. "
    "Keep replies under 120 words. Use friendly tone, bullet points when listing. "
    "If asked about expense splits, offer practical advice (equal vs custom). "
    "If asked about safety, mention SOS feature and emergency contacts."
)


@router.post("/ai/chat")
async def ai_chat(req: ChatReq, user: dict = Depends(current_user), db=Depends(get_db)):
    if not EMERGENT_LLM_KEY:
        # Return mock response if no LLM key configured
        return {"reply": "Hi! I'm TripBuddy, your travel assistant. I'd love to help you plan your trip and split expenses fairly with your crew! What would you like to know?"}

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=req.session_id,
            system_message=TRIPBUDDY_SYSTEM,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        reply = await chat.send_message(UserMessage(text=req.message))
    except ImportError:
        # Fallback if emergentintegrations not installed
        logger.warning("emergentintegrations not installed, using mock response")
        reply = "Hi! I'm TripBuddy. I'd love to help, but my AI features are currently offline. Please try again later!"
    except Exception as e:
        logger.exception("AI chat failed")
        raise HTTPException(500, f"AI error: {e}")

    msg = {
        "id": str(uuid.uuid4()),
        "session_id": req.session_id,
        "user_id": user["id"],
        "message": req.message,
        "reply": reply,
        "created_at": now_iso(),
    }
    await db.ai_messages.insert_one(msg)
    return {"reply": reply}


@router.get("/ai/history/{session_id}")
async def ai_history(session_id: str, user: dict = Depends(current_user), db=Depends(get_db)):
    cursor = db.ai_messages.find(
        {"session_id": session_id, "user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", 1)
    return await cursor.to_list(200)
