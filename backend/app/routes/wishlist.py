from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import json

from ..database import get_db
from ..models.destination import Destination
from ..models.wishlist import Wishlist

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])

# Temporary user extraction
async def get_current_user(request: Request):
    # For now, return a demo user
    auth_header = request.headers.get("Authorization")
    if auth_header:
        # In production, decode JWT here
        pass
    return {"id": "demo_user_123", "email": "demo@example.com", "sub": "demo_user_123"}

@router.get("/")
async def get_wishlist(
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get user's wishlist"""
    try:
        # Try to query wishlist table
        items = db.query(Wishlist).filter(Wishlist.keycloak_user_id == user["id"]).all()
        
        result = []
        for item in items:
            dest = db.query(Destination).filter(Destination.id == item.destination_id).first()
            if dest:
                result.append({
                    "id": item.id,
                    "destination_id": dest.id,
                    "name": dest.name,
                    "location": dest.location,
                    "category": dest.category,
                    "rating": dest.rating,
                    "photo": dest.photo_url,
                    "price": dest.price,
                    "price_label": dest.price_label,
                    "match_score": dest.match_score
                })
        return {"items": result}
    except Exception as e:
        print(f"Wishlist error: {e}")
        # Table might not exist yet
        return {"items": []}

@router.post("/")
async def add_to_wishlist(
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Add to wishlist"""
    try:
        data = await request.json()
        destination_id = data.get("destination_id")
        
        # Check if already exists
        existing = db.query(Wishlist).filter(
            Wishlist.keycloak_user_id == user["id"],
            Wishlist.destination_id == destination_id
        ).first()
        
        if existing:
            return {"success": True, "message": "Already in wishlist"}
        
        new_item = Wishlist(
            keycloak_user_id=user["id"],
            destination_id=destination_id
        )
        db.add(new_item)
        db.commit()
        
        return {"success": True, "message": "Added to wishlist"}
    except Exception as e:
        print(f"Add to wishlist error: {e}")
        return {"success": False, "message": str(e)}

@router.delete("/{destination_id}")
async def remove_from_wishlist(
    destination_id: int,
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Remove from wishlist"""
    try:
        item = db.query(Wishlist).filter(
            Wishlist.keycloak_user_id == user["id"],
            Wishlist.destination_id == destination_id
        ).first()
        
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        db.delete(item)
        db.commit()
        
        return {"success": True, "message": "Removed from wishlist"}
    except Exception as e:
        print(f"Remove from wishlist error: {e}")
        return {"success": False, "message": str(e)}