from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import json

from ..database import get_db
from ..models.destination import Destination
from .wishlist import get_current_user

router = APIRouter(prefix="/api/destinations", tags=["Destinations"])

@router.get("/")
async def get_all_destinations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all destinations with pagination"""
    query = db.query(Destination).filter(Destination.is_active == True)
    
    if category and category != 'All':
        query = query.filter(Destination.category == category)
    
    total = query.count()
    destinations = query.offset(skip).limit(limit).all()
    
    return {
        "success": True,
        "data": [
            {
                "id": d.id,
                "name": d.name,
                "location": d.location,
                "region": d.region,
                "category": d.category,
                "rating": float(d.rating) if d.rating else 4.0,
                "reviews": d.reviews,
                "price": float(d.price) if d.price else 0,
                "price_label": d.price_label,
                "photo": d.photo_url,  # Use photo_url
                "description": d.description,
                "match_score": d.match_score,
                "source": d.source
            }
            for d in destinations
        ],
        "total": total
    }

@router.get("/{destination_id}")
async def get_destination(
    destination_id: int,
    db: Session = Depends(get_db)
):
    """Get a single destination by ID"""
    dest = db.query(Destination).filter(Destination.id == destination_id).first()
    
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    extra_data = dest.extra_data if dest.extra_data else {}
    if isinstance(extra_data, str):
        extra_data = json.loads(extra_data)
    
    pricing = extra_data.get("pricing", {"type": "free"})
    
    return {
        "success": True,
        "data": {
            "id": dest.id,
            "name": dest.name,
            "location": dest.location,
            "region": dest.region,
            "lat": float(dest.lat) if dest.lat else None,
            "lng": float(dest.lng) if dest.lng else None,
            "category": dest.category,
            "rating": float(dest.rating) if dest.rating else 4.0,
            "reviews": dest.reviews,
            "photo": dest.photo_url,  # Use photo_url
            "description": dest.description,
            "price": float(dest.price) if dest.price else 0,
            "price_label": dest.price_label,
            "features": dest.features or [],
            "ai_reason": dest.ai_reason,
            "match_score": dest.match_score,
            "extra_data": extra_data,
            "pricing": pricing,
            "source": dest.source
        }
    }