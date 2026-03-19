# backend/app/routes/interactions.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.interaction import Interaction
from models.preference import UserPreference
from services.ai_engine import update_user_vector_from_interaction, FEATURES
from routes.wishlist import get_current_user

router = APIRouter(prefix="/interactions", tags=["Interactions"])

ACTION_WEIGHTS = {
    'view':     0.3,
    'wishlist': 0.7,
    'book':     1.0,
    'ignore':   0.1,
}

class InteractionIn(BaseModel):
    dest_id: int
    action:  str  # 'view', 'wishlist', 'book', 'ignore'


# POST /interactions — log action and update user vector
@router.post("")
async def log_interaction(
    payload: InteractionIn,
    db:      Session = Depends(get_db),
    user:    dict    = Depends(get_current_user),
):
    # 1. Log the interaction
    interaction = Interaction(
        user_id = user["sub"],
        dest_id = payload.dest_id,
        action  = payload.action,
        weight  = ACTION_WEIGHTS.get(payload.action, 0.3),
    )
    db.add(interaction)

    # 2. Fetch current preferences
    prefs = db.query(UserPreference).filter(
        UserPreference.user_id == user["sub"]
    ).first()

    if prefs:
        current_prefs = {f: getattr(prefs, f, 0.0) for f in FEATURES}

        # 3. Nudge user vector based on interaction
        updated = update_user_vector_from_interaction(
            current_prefs,
            payload.dest_id,
            payload.action,
        )

        # 4. Save updated preferences
        for field, value in updated.items():
            setattr(prefs, field, value)

    db.commit()

    return {"message": "Interaction logged", "action": payload.action, "dest_id": payload.dest_id}