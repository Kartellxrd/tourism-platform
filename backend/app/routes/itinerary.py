from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import secrets

from ..database import get_db
from ..models.itinerary import Itinerary
from ..routes.wishlist import get_current_user

router = APIRouter(prefix="/itinerary", tags=["Itinerary"])

class ItinerarySaveRequest(BaseModel):
    title: Optional[str] = None
    days: int
    budget: str
    interests: List[str]
    total_cost: float
    daily_plan: List[dict]

def generate_share_token():
    return secrets.token_urlsafe(16)

@router.post("/save")
async def save_itinerary(
    request: ItinerarySaveRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Save itinerary to user's account"""
    
    itinerary = Itinerary(
        user_id=user["sub"],
        title=request.title or f"{request.days}-Day Trip",
        days=request.days,
        budget=request.budget,
        interests=request.interests,
        total_cost=request.total_cost,
        daily_plan=[day.dict() for day in request.daily_plan] if hasattr(request.daily_plan[0], 'dict') else request.daily_plan,
        share_token=generate_share_token()
    )
    
    db.add(itinerary)
    db.commit()
    db.refresh(itinerary)
    
    return {
        "success": True,
        "itinerary_id": itinerary.id,
        "share_token": itinerary.share_token,
        "message": "Itinerary saved successfully"
    }

@router.get("/user")
async def get_user_itineraries(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get all saved itineraries for logged-in user"""
    
    itineraries = db.query(Itinerary).filter(
        Itinerary.user_id == user["sub"]
    ).order_by(Itinerary.created_at.desc()).all()
    
    result = []
    for it in itineraries:
        result.append({
            "id": it.id,
            "title": it.title,
            "days": it.days,
            "budget": it.budget,
            "total_cost": it.total_cost,
            "share_token": it.share_token,
            "created_at": it.created_at.isoformat()
        })
    
    return {"success": True, "itineraries": result}

@router.get("/share/{token}")
async def get_shared_itinerary(
    token: str,
    db: Session = Depends(get_db)
):
    """Get shared itinerary by token (no auth required)"""
    
    itinerary = db.query(Itinerary).filter(Itinerary.share_token == token).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    
    return {
        "success": True,
        "itinerary": {
            "title": itinerary.title,
            "days": itinerary.days,
            "budget": itinerary.budget,
            "interests": itinerary.interests,
            "total_cost": itinerary.total_cost,
            "daily_plan": itinerary.daily_plan,
            "created_at": itinerary.created_at.isoformat()
        }
    }

@router.delete("/{itinerary_id}")
async def delete_itinerary(
    itinerary_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Delete a saved itinerary"""
    
    itinerary = db.query(Itinerary).filter(
        Itinerary.id == itinerary_id,
        Itinerary.user_id == user["sub"]
    ).first()
    
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    
    db.delete(itinerary)
    db.commit()
    
    return {"success": True, "message": "Itinerary deleted"}