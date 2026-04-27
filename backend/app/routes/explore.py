from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
import httpx
import math
import os
import json
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..models.destination import Destination
from ..routes.wishlist import get_current_user

router = APIRouter(prefix="/api/explore", tags=["Explore"])

def calculate_distance(lat1, lng1, lat2, lng2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

def estimate_travel_time(distance_km):
    if distance_km < 5:
        speed = 30
    elif distance_km < 20:
        speed = 45
    else:
        speed = 60
    return max(1, round(distance_km / speed * 60))

def auto_detect_pricing(name, types):
    """Auto-detect pricing from place name and types"""
    name_lower = name.lower()
    
    free_keywords = ['museum', 'park', 'garden', 'church', 'cathedral', 'monument', 
                     'hiking', 'viewpoint', 'waterfall', 'library', 'square', 'mall']
    for kw in free_keywords:
        if kw in name_lower:
            return {"type": "free", "price": 0, "price_label": "FREE"}
    
    wildlife_keywords = ['game reserve', 'national park', 'safari', 'wildlife', 'nature reserve']
    for kw in wildlife_keywords:
        if kw in name_lower:
            return {"type": "mixed", "price": 200, "price_label": "PAID", "per_person": 200, "per_vehicle": 150}
    
    return {"type": "per_person", "price": 100, "price_label": "PAID", "adult": 100, "child": 50}

def auto_categorize(types, name):
    """Auto-detect category from place types"""
    types_lower = [t.lower() for t in (types or [])]
    name_lower = name.lower()
    
    if 'museum' in types_lower or 'art_gallery' in types_lower:
        return 'Culture'
    if 'park' in types_lower or 'natural_feature' in types_lower or 'wildlife' in name_lower:
        return 'Wildlife'
    if 'shopping_mall' in types_lower or 'store' in types_lower:
        return 'Shopping'
    if 'amusement_park' in types_lower or 'hiking' in name_lower:
        return 'Adventure'
    if 'lodging' in types_lower or 'hotel' in types_lower:
        return 'Accommodation'
    if 'historical' in types_lower or 'monument' in types_lower:
        return 'Historical'
    
    return 'Attraction'

@router.get("")
async def get_explore(
    lat: float = Query(...),
    lng: float = Query(...),
    radius: float = Query(50, description="Radius in km"),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    GOOGLE_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY") or os.getenv("GOOGLE_MAPS_KEY")
    if not GOOGLE_API_KEY:
        return {"success": False, "error": "Google API key not configured"}

    # ── STEP 1: Fetch and SAVE Google Places to Database ──
    radius_m = radius * 1000
    google_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    google_params = {
        "location": f"{lat},{lng}",
        "radius": radius_m,
        "type": "tourist_attraction",
        "key": GOOGLE_API_KEY,
    }

    saved_count = 0
    async with httpx.AsyncClient() as client:
        resp = await client.get(google_url, params=google_params)
        if resp.status_code == 200:
            data = resp.json()
            for place in data.get("results", []):
                if place.get("rating", 0) < 3.5 or "photos" not in place:
                    continue
                
                google_place_id = place["place_id"]
                
                existing = db.query(Destination).filter(
                    Destination.google_place_id == google_place_id
                ).first()
                
                if existing:
                    continue
                
                pricing = auto_detect_pricing(place.get("name", ""), place.get("types", []))
                category_type = auto_categorize(place.get("types", []), place.get("name", ""))
                
                photo_url = None
                if place.get("photos"):
                    photo_ref = place["photos"][0]["photo_reference"]
                    photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference={photo_ref}&key={GOOGLE_API_KEY}"
                
                place_lat = place["geometry"]["location"]["lat"]
                place_lng = place["geometry"]["location"]["lng"]
                distance = calculate_distance(lat, lng, place_lat, place_lng)
                
                match_score = 70
                if distance < 5:
                    match_score += 15
                elif distance < 10:
                    match_score += 10
                if place.get("rating", 0) >= 4.5:
                    match_score += 10
                match_score = min(98, match_score)
                
                # Use extra_data instead of metadata
                new_dest = Destination(
                    google_place_id=google_place_id,
                    name=place.get("name"),
                    location=place.get("vicinity", "Botswana"),
                    region="Gaborone",
                    lat=place_lat,
                    lng=place_lng,
                    category=category_type,
                    rating=place.get("rating", 4.0),
                    reviews=place.get("user_ratings_total", 0),
                    photo_url=photo_url,
                    description=f"Nearby tourist attraction: {place.get('name')}. Located at {place.get('vicinity', 'Botswana')}",
                    price=pricing.get("price", 0),
                    price_label=pricing.get("price_label", "FREE"),
                    features=[t.replace("_", " ").title() for t in place.get("types", []) if t not in ["point_of_interest", "establishment"]][:5],
                    match_score=match_score,
                    place_id=f"gp_{google_place_id}",
                    source="google",
                    extra_data={
                        "pricing": pricing,
                        "types": place.get("types", []),
                        "vicinity": place.get("vicinity"),
                        "fetched_at": datetime.now().isoformat()
                    },
                    is_active=True
                )
                
                db.add(new_dest)
                saved_count += 1
            
            db.commit()
            print(f"✅ Saved {saved_count} new Google Places to database")

    # ── STEP 2: Fetch ALL destinations from database ──
    query = db.query(Destination).filter(Destination.is_active == True)
    if category and category != 'All':
        query = query.filter(Destination.category == category)
    db_dests = query.all()

    results = []
    for dest in db_dests:
        if dest.lat is None or dest.lng is None:
            continue
        try:
            dest_lat = float(dest.lat)
            dest_lng = float(dest.lng)
            distance = calculate_distance(lat, lng, dest_lat, dest_lng)
            if distance > radius:
                continue
            travel_time = estimate_travel_time(distance)
            
            # Parse extra_data
            extra_data = dest.extra_data if dest.extra_data else {}
            if isinstance(extra_data, str):
                extra_data = json.loads(extra_data)
            
            pricing = extra_data.get("pricing", {})
            
            results.append({
                "id": dest.id,
                "name": dest.name,
                "location": dest.location,
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
                "gradient": dest.gradient,
                "desc": dest.description,
                "features": dest.features or [],
                "ai_reason": dest.ai_reason,
                "match_score": dest.match_score or 50,
                "place_id": dest.place_id,
                "distance_km": round(distance, 2),
                "travel_time_min": travel_time,
                "source": dest.source,
                "google_place_id": dest.google_place_id,
                "pricing_type": pricing.get("type", "free")
            })
        except (ValueError, TypeError) as e:
            print(f"Error processing destination {dest.id}: {e}")
            continue

    results.sort(key=lambda x: x["distance_km"])
    
    return {
        "success": True,
        "data": results,
        "count": len(results),
        "db_count": len(results),
        "new_saved": saved_count,
        "message": f"Found {len(results)} attractions within {radius}km. Saved {saved_count} new places."
    }

@router.get("/destination/{destination_id}")
async def get_destination_detail(
    destination_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Get full details for a specific destination by ID"""
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
            "lat": float(dest.lat) if dest.lat else None,
            "lng": float(dest.lng) if dest.lng else None,
            "category": dest.category,
            "rating": float(dest.rating) if dest.rating else 4.0,
            "reviews": dest.reviews,
            "photo": dest.photo_url,
            "desc": dest.description,
            "price": float(dest.price) if dest.price else 0,
            "price_label": dest.price_label,
            "features": dest.features or [],
            "ai_reason": dest.ai_reason,
            "match_score": dest.match_score,
            "extra_data": extra_data,
            "pricing": pricing,
            "source": dest.source,
            "created_at": dest.created_at.isoformat() if dest.created_at else None
        }
    }