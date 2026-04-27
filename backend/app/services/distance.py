import math
from typing import List, Dict, Optional
from sqlalchemy.orm import Session

def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two points in kilometers"""
    R = 6371
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    
    a = math.sin(delta_lat/2)**2 + \
        math.cos(lat1_rad) * math.cos(lat2_rad) * \
        math.sin(delta_lng/2)**2
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return round(R * c, 1)


def calculate_travel_time(distance_km: float, mode: str = "driving") -> int:
    """Estimate travel time in minutes"""
    speeds = {
        "driving": 40,
        "walking": 5,
        "public": 25,
    }
    speed = speeds.get(mode, 40)
    return int((distance_km / speed) * 60)


def get_nearby_destinations(
    db: Session,
    user_lat: float,
    user_lng: float,
    radius_km: float = 25,
    category: Optional[str] = None,
    limit: int = 50
) -> List[Dict]:
    """Find destinations within radius and add distance info"""
    from ..models.destination import Destination
    
    query = db.query(Destination)
    if category:
        query = query.filter(Destination.category == category)
    
    destinations = query.all()
    nearby = []
    
    for dest in destinations:
        if dest.lat is None or dest.lng is None:
            continue
            
        distance = haversine_distance(
            user_lat, user_lng,
            float(dest.lat), float(dest.lng)
        )
        
        if distance <= radius_km:
            dest_dict = dest.to_dict()
            dest_dict["distance_km"] = distance
            dest_dict["travel_time_min"] = calculate_travel_time(distance)
            nearby.append(dest_dict)
    
    nearby.sort(key=lambda x: x["distance_km"])
    return nearby[:limit]