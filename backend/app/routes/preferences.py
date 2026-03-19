# backend/app/routes/preferences.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models.preference import UserPreference
from routes.wishlist import get_current_user

router = APIRouter(prefix="/preferences", tags=["Preferences"])


class PreferenceIn(BaseModel):
    wildlife:     Optional[float] = 0.0
    photography:  Optional[float] = 0.0
    luxury:       Optional[float] = 0.0
    adventure:    Optional[float] = 0.0
    culture:      Optional[float] = 0.0
    family:       Optional[float] = 0.0
    water:        Optional[float] = 0.0
    desert:       Optional[float] = 0.0
    birding:      Optional[float] = 0.0
    stargazing:   Optional[float] = 0.0
    budget:       Optional[str]   = 'mid'
    travel_style: Optional[str]   = 'solo'


class PreferenceOut(PreferenceIn):
    user_id: str
    class Config:
        from_attributes = True


# GET /preferences — fetch current user preferences
@router.get("", response_model=PreferenceOut)
async def get_preferences(
    db:   Session = Depends(get_db),
    user: dict    = Depends(get_current_user),
):
    prefs = db.query(UserPreference).filter(
        UserPreference.user_id == user["sub"]
    ).first()

    if not prefs:
        # Return defaults if no preferences saved yet
        return PreferenceOut(user_id=user["sub"])

    return prefs


# POST /preferences — save or update preferences
@router.post("", response_model=PreferenceOut)
async def save_preferences(
    payload: PreferenceIn,
    db:      Session = Depends(get_db),
    user:    dict    = Depends(get_current_user),
):
    prefs = db.query(UserPreference).filter(
        UserPreference.user_id == user["sub"]
    ).first()

    if prefs:
        # Update existing
        for field, value in payload.model_dump().items():
            setattr(prefs, field, value)
    else:
        # Create new
        prefs = UserPreference(
            user_id=user["sub"],
            **payload.model_dump()
        )
        db.add(prefs)

    db.commit()
    db.refresh(prefs)
    return prefs