from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from ..database import get_db
from ..models.wildlife import WildlifeSighting, WildlifeCalendar
from ..models.destination import Destination

router = APIRouter(prefix="/wildlife", tags=["Wildlife Intelligence"])


@router.get("/sightings")
async def get_wildlife_sightings(
    animal: Optional[str] = Query(None, description="Filter by animal name"),
    destination_id: Optional[int] = Query(None, description="Filter by destination"),
    month: Optional[int] = Query(None, description="Filter by month (1-12)"),
    db: Session = Depends(get_db)
):
    """Get wildlife sighting information with intelligent filtering"""
    
    query = db.query(WildlifeSighting)
    
    if animal:
        query = query.filter(WildlifeSighting.animal_name.ilike(f"%{animal}%"))
    if destination_id:
        query = query.filter(WildlifeSighting.destination_id == destination_id)
    
    sightings = query.all()
    
    # If month specified, filter best_months
    if month:
        sightings = [s for s in sightings if month in s.best_months]
    
    # Enhance with destination info
    result = []
    for sighting in sightings:
        dest = db.query(Destination).filter(Destination.id == sighting.destination_id).first()
        result.append({
            "id": sighting.id,
            "animal_name": sighting.animal_name,
            "animal_category": sighting.animal_category,
            "destination": {
                "id": dest.id if dest else None,
                "name": dest.name if dest else "Unknown",
                "location": dest.location if dest else None
            },
            "best_months": sighting.best_months,
            "best_hours": f"{sighting.best_hours_start}:00 - {sighting.best_hours_end}:00",
            "probability": sighting.probability_rating,
            "viewing_tips": sighting.viewing_tips,
            "habitat": sighting.habitat
        })
    
    return {
        "success": True,
        "total": len(result),
        "data": result,
        "current_month": datetime.now().month,
        "current_hour": datetime.now().hour
    }


@router.get("/calendar")
async def get_wildlife_calendar(
    month: Optional[int] = Query(None, description="Specific month (1-12)"),
    db: Session = Depends(get_db)
):
    """Get monthly wildlife calendar with seasonal information"""
    
    if month:
        calendar = db.query(WildlifeCalendar).filter(WildlifeCalendar.month == month).first()
        if not calendar:
            raise HTTPException(status_code=404, detail="Month not found")
        data = [calendar]
    else:
        data = db.query(WildlifeCalendar).order_by(WildlifeCalendar.month).all()
    
    result = []
    for cal in data:
        result.append({
            "month": cal.month,
            "month_name": cal.month_name,
            "events": cal.events,
            "wildlife_rating": cal.wildlife_rating,
            "pros": cal.pros,
            "cons": cal.cons,
            "weather": {
                "avg_temp_high": cal.avg_temp_high,
                "avg_temp_low": cal.avg_temp_low,
                "rainfall_mm": cal.rainfall_mm
            },
            "season_type": cal.season_type
        })
    
    return {
        "success": True,
        "current_month": datetime.now().month,
        "current_season": next((r["season_type"] for r in result if r["month"] == datetime.now().month), None),
        "data": result
    }


@router.get("/best-time/{animal}")
async def get_best_time_for_animal(
    animal: str,
    db: Session = Depends(get_db)
):
    """Get intelligent recommendation for best time to see a specific animal"""
    
    sightings = db.query(WildlifeSighting).filter(
        WildlifeSighting.animal_name.ilike(f"%{animal}%")
    ).all()
    
    if not sightings:
        return {
            "success": False,
            "message": f"No data found for {animal}. Try asking about lions, elephants, rhinos, etc.",
            "animal": animal
        }
    
    # Find best months across all destinations
    all_months = set()
    for sighting in sightings:
        all_months.update(sighting.best_months)
    
    best_months = sorted(list(all_months))
    current_month = datetime.now().month
    is_current_good = current_month in best_months
    
    # Get monthly details for best months
    monthly_details = []
    for month in best_months[:3]:
        calendar = db.query(WildlifeCalendar).filter(WildlifeCalendar.month == month).first()
        if calendar:
            monthly_details.append({
                "month": month,
                "month_name": calendar.month_name,
                "season_type": calendar.season_type,
                "wildlife_rating": calendar.wildlife_rating
            })
    
    # Best destinations
    best_destinations = []
    for sighting in sightings[:3]:
        dest = db.query(Destination).filter(Destination.id == sighting.destination_id).first()
        if dest:
            best_destinations.append({
                "id": dest.id,
                "name": dest.name,
                "probability": sighting.probability_rating,
                "best_hours": f"{sighting.best_hours_start}:00-{sighting.best_hours_end}:00",
                "tip": sighting.viewing_tips
            })
    
    return {
        "success": True,
        "animal": animal.capitalize(),
        "current_month_optimal": is_current_good,
        "best_months": best_months,
        "monthly_insight": monthly_details,
        "best_destinations": best_destinations,
        "general_tip": f"Best time to see {animal}s is during {'dry season (May-October)' if best_months[0] >= 5 else 'green season'}",
        "action": "wildlife_query"
    }


@router.get("/today")
async def get_today_wildlife_tips(
    db: Session = Depends(get_db)
):
    """Get wildlife tips for TODAY based on current month and time"""
    
    current_month = datetime.now().month
    current_hour = datetime.now().hour
    
    calendar = db.query(WildlifeCalendar).filter(WildlifeCalendar.month == current_month).first()
    
    # Find what animals are best to see this month
    best_animals = db.query(WildlifeSighting).filter(
        WildlifeSighting.best_months.contains([current_month])
    ).limit(5).all()
    
    time_of_day = "morning" if current_hour < 12 else "afternoon" if current_hour < 17 else "evening"
    
    time_tips = {
        "morning": "🦁 Early morning (6am-9am) is prime time for predators! Lions, leopards, and wild dogs are most active.",
        "afternoon": "☀️ Afternoon is great for elephants, hippos, and bird watching near water sources.",
        "evening": "🌅 Sunset game drives offer incredible golden hour photography and nocturnal animal sightings!"
    }
    
    return {
        "success": True,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "month": calendar.month_name if calendar else None,
        "season": calendar.season_type if calendar else None,
        "time_of_day": time_of_day,
        "time_tip": time_tips.get(time_of_day, "Any time is good for wildlife!"),
        "wildlife_rating": f"{'⭐' * (calendar.wildlife_rating // 2)} ({calendar.wildlife_rating}/10)" if calendar else None,
        "best_animals_today": [{"name": a.animal_name, "probability": a.probability_rating} for a in best_animals],
        "tip_of_the_day": calendar.events[0] if calendar and calendar.events else "Visit water sources for best wildlife viewing!"
    }