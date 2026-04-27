from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models.preference import UserPreference
from ..services.ai_engine import get_recommendations, FEATURES

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("")
async def recommendations(
    db: Session = Depends(get_db),
    user_id: Optional[str] = Query(None, description="Optional user ID"),
):
    """
    Returns REAL AI recommendations using cosine similarity
    Based on user preferences and actual database destinations
    """
    # Get user preferences
    if user_id:
        prefs = db.query(UserPreference).filter(
            UserPreference.user_id == user_id
        ).first()
    else:
        prefs = db.query(UserPreference).first()
    
    if not prefs:
        # Default preferences (neutral)
        preferences_dict = {f: 0.5 for f in FEATURES}
        budget_pref = 'mid'
    else:
        preferences_dict = {
            f: getattr(prefs, f, 0.5) for f in FEATURES
        }
        budget_pref = getattr(prefs, 'budget', 'mid')
    
    # Add budget to preferences (affects luxury score)
    budget_value = {
        'budget': 0.0,  # Prefers cheap places
        'mid': 0.5,     # Balanced
        'luxury': 1.0   # Prefers expensive
    }.get(budget_pref, 0.5)
    
    # Override luxury with budget preference
    preferences_dict['luxury'] = budget_value
    
    # Get REAL recommendations from database
    ranked = get_recommendations(preferences_dict, db)
    
    return {
        "success": True,
        "user_id": user_id or prefs.user_id if prefs else "default",
        "recommendations": ranked,
        "total": len(ranked),
        "based_on_preferences": preferences_dict,
        "message": f"AI recommendations based on {len(ranked)} destinations using cosine similarity"
    }