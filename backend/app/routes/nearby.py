from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
import math

from ..database import get_db
from ..models.destination import Destination

router = APIRouter(prefix="/api/nearby", tags=["Nearby"])

def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance in km using Haversine formula"""
    R = 6371
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    
    a = (math.sin(delta_lat / 2) ** 2 + 
         math.cos(lat1_rad) * math.cos(lat2_rad) * 
         math.sin(delta_lng / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def estimate_travel_time(distance_km: float) -> int:
    """Estimate travel time in minutes"""
    if distance_km < 5:
        speed = 30
    elif distance_km < 20:
        speed = 45
    else:
        speed = 60
    
    return max(1, round((distance_km / speed) * 60))

@router.get("")
async def get_nearby_destinations(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius: float = Query(10, description="Radius in km"),
    limit: int = Query(50, description="Max results"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db)
):
    """Get destinations near a location with distance calculation"""
    
    query = db.query(Destination)
    
    if category and category != 'All':
        query = query.filter(Destination.category == category)
    
    destinations = query.all()
    
    nearby = []
    
    for dest in destinations:
        if dest.lat is None or dest.lng is None:
            continue
        
        try:
            dest_lat = float(dest.lat)
            dest_lng = float(dest.lng)
        except (ValueError, TypeError):
            continue
        
        distance = calculate_distance(lat, lng, dest_lat, dest_lng)
        
        if distance <= radius:
            travel_time = estimate_travel_time(distance)
            
            nearby.append({
                "id": dest.id,
                "name": dest.name,
                "location": dest.location,
                "region": dest.region,
                "lat": dest_lat,
                "lng": dest_lng,
                "price": float(dest.price) if dest.price else 0,
                "price_label": dest.price_label or "FREE",
                "rating": float(dest.rating) if dest.rating else 4.5,
                "reviews": dest.reviews or 0,
                "category": dest.category or "Attraction",
                "tag": dest.tag,
                "tag_color": dest.tag_color,
                "photo": dest.photo_url,
                "gradient": dest.gradient or "from-cyan-500 to-teal-600",
                "desc": dest.description,
                "features": dest.features or [],
                "ai_reason": dest.ai_reason,
                "match_score": dest.match_score or 50,
                "distance_km": round(distance, 2),
                "travel_time_min": travel_time,
                "place_id": dest.place_id,
                "created_at": str(dest.created_at) if dest.created_at else None,
            })
    
    nearby.sort(key=lambda x: x['distance_km'])
    nearby = nearby[:limit]
    
    return {
        "success": True,
        "data": nearby,
        "count": len(nearby),
        "location": {"lat": lat, "lng": lng},
        "radius": radius
    }