# backend/app/routes/ai_query.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models.preference import UserPreference
from services.query_engine import handle_query
from services.ai_engine import FEATURES
from routes.wishlist import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


class QueryIn(BaseModel):
    query: str


@router.post("/query")
async def ai_query(
    payload: QueryIn,
    db:      Session = Depends(get_db),
    user:    dict    = Depends(get_current_user),
):
    # Get user preferences for personalised responses
    prefs = db.query(UserPreference).filter(
        UserPreference.user_id == user["sub"]
    ).first()

    user_preferences = None
    if prefs:
        user_preferences = {f: getattr(prefs, f, 0.0) for f in FEATURES}

    result = handle_query(payload.query, user_preferences)

    return {
        "response": result["response"],
        "dest_id":  result.get("dest_id"),
        "action":   result.get("action"),
    }