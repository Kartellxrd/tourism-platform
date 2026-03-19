# backend/app/routes/recommendations.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.preference import UserPreference
from services.ai_engine import get_recommendations, FEATURES
from routes.wishlist import get_current_user

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


# GET /recommendations — returns destinations ranked by AI match score
@router.get("")
async def recommendations(
    db:   Session = Depends(get_db),
    user: dict    = Depends(get_current_user),
):
    # Fetch user preferences from MySQL
    prefs = db.query(UserPreference).filter(
        UserPreference.user_id == user["sub"]
    ).first()

    if not prefs:
        # No preferences yet — return equal scores
        preferences_dict = {f: 0.5 for f in FEATURES}
    else:
        preferences_dict = {
            f: getattr(prefs, f, 0.0) for f in FEATURES
        }

    # Run cosine similarity
    ranked = get_recommendations(preferences_dict)

    return {
        "user_id": user["sub"],
        "recommendations": ranked,
        "total": len(ranked),
    }