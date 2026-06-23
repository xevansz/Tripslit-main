"""Pydantic models for request/response validation."""

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, EmailStr, field_validator


def now_iso() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).isoformat()


# ---------- Auth Models ----------
class SignupReq(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
    phone: Optional[str] = None


class LoginReq(BaseModel):
    email: EmailStr
    password: str


class OtpVerifyReq(BaseModel):
    email: EmailStr
    code: str


class ProfileSetupReq(BaseModel):
    name: str
    avatar: Optional[str] = None
    currency: str = "USD"
    language: str = "en"


class TokenResp(BaseModel):
    access_token: str
    user: dict


# ---------- Trip Models ----------
class TripCreateReq(BaseModel):
    name: str
    destination: str
    start_date: str
    end_date: str
    cover_image: Optional[str] = None
    participants: List[str] = []

    @field_validator("end_date")
    @classmethod
    def validate_dates(cls, end_date: str, info) -> str:
        start_date = info.data.get("start_date")
        if start_date and end_date:
            try:
                start = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
                end = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
                if end < start:
                    raise ValueError("End date must be after start date")
            except ValueError as e:
                if "End date must be after start date" in str(e):
                    raise
        return end_date


# ---------- Expense Models ----------
class ExpenseCreateReq(BaseModel):
    trip_id: str
    amount: float
    description: str
    category: str
    paid_by: str
    split_method: Literal["equal", "percentage", "custom"] = "equal"
    split_between: List[str] = []
    receipt: Optional[str] = None


# ---------- Borrow Models ----------
class BorrowCreateReq(BaseModel):
    from_user: str
    to_user: str
    amount: float
    reason: str
    due_date: Optional[str] = None


# ---------- Chat Models ----------
class ChatReq(BaseModel):
    session_id: str
    message: str
    trip_context: Optional[str] = None


# ---------- Wallet Models ----------
class WalletTxReq(BaseModel):
    trip_id: str
    type: Literal["contribute", "withdraw", "expense", "refund"]
    amount: float
    member: str
    note: Optional[str] = None


# ---------- GroupPay Models ----------
class GroupPayCreateReq(BaseModel):
    trip_id: Optional[str] = None
    merchant: str
    amount: float
    members: List[str] = []
    split_method: Literal["equal", "percentage", "custom"] = "equal"
