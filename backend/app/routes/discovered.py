from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ..database import get_db, SessionLocal
from ..models.destination import Destination
from ..routes.wishlist import get_current_user

router = APIRouter(prefix="/api/discovered", tags=["Discovered"])

class DiscoveredPlaceIn(BaseModel):
    name: str
    location: str
    lat: float
    lng: float
    category: str
    rating: float = 4.5
    reviews: int = 0
    photo_url: str = None
    google_place_id: str
    features: list = []

@router.post("/add")
async def add_discovered_place(data: DiscoveredPlaceIn, user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        # Check if already exists by place_id
        existing = db.query(Destination).filter(Destination.place_id == f"gp_{data.google_place_id}").first()
        if existing:
            return {"success": True, "message": "Already in database", "id": existing.id}

        # Map tag and other defaults
        gradients = {
            "Wildlife": "from-green-500 to-emerald-600",
            "Culture": "from-purple-500 to-indigo-600",
            "Historical": "from-amber-500 to-orange-600",
            "Adventure": "from-blue-500 to-cyan-600",
            "Attraction": "from-cyan-500 to-teal-600",
        }
        tag_colors = {
            "Wildlife": "#059669",
            "Culture": "#7C3AED",
            "Historical": "#D97706",
            "Adventure": "#2563EB",
            "Attraction": "#0891B2",
        }

        dest = Destination(
            name=data.name,
            location=data.location,
            lat=data.lat,
            lng=data.lng,
            price=0,
            price_label="FREE",
            rating=data.rating,
            reviews=data.reviews,
            category=data.category,
            tag="User Added",
            tag_color=tag_colors.get(data.category, "#0891B2"),
            photo_url=data.photo_url,
            gradient=gradients.get(data.category, "from-cyan-500 to-teal-600"),
            description=f"Discover {data.name}",
            features=data.features if data.features else ["Sightseeing"],
            ai_reason=f"Saved by a traveler",
            match_score=75,
            place_id=f"gp_{data.google_place_id}",
        )
        db.add(dest)
        db.commit()
        db.refresh(dest)
        return {"success": True, "message": "Destination saved", "id": dest.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()