from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import json

from ..database import get_db
from ..models.destination import Destination
from ..models.booking import Booking
from ..models.wishlist import Wishlist
from ..models.user_activity import UserActivity
from ..models.wildlife import WildlifeSighting, WildlifeCalendar
from ..models.preference import UserPreference
from ..routes.wishlist import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])

# ============ MODELS ============

class DestinationCreate(BaseModel):
    name: str
    location: str
    region: str
    lat: float = -24.6541
    lng: float = 25.9323
    price: float
    price_label: str
    category: str
    description: str
    features: List[str] = []
    photo_url: str = "https://images.pexels.com/photos/258117/pexels-photo-258117.jpeg?w=800&h=600&fit=crop"

class DestinationUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    region: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    price: Optional[float] = None
    price_label: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    category: Optional[str] = None
    tag: Optional[str] = None
    tag_color: Optional[str] = None
    photo_url: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    ai_reason: Optional[str] = None
    opening_hours: Optional[str] = None
    best_time: Optional[str] = None
    vehicle_fee: Optional[float] = None

class BookingUpdate(BaseModel):
    booking_status: str
    payment_status: Optional[str] = None

class WildlifeSightingCreate(BaseModel):
    destination_id: int
    animal_name: str
    animal_category: str
    best_months: List[int]
    best_hours_start: int
    best_hours_end: int
    probability_rating: int
    viewing_tips: str
    habitat: str

class WildlifeCalendarUpdate(BaseModel):
    month: int
    wildlife_rating: int
    events: List[str]
    pros: List[str]
    cons: List[str]
    season_type: str

# ============ ADMIN CHECK ENDPOINT ============

@router.get("/check")
async def check_admin_status(
    user: dict = Depends(get_current_user)
):
    """Check if current user has admin role"""
    roles = user.get("roles", [])
    is_admin = "admin" in roles or "super_admin" in roles
    
    return {
        "isAdmin": is_admin,
        "roles": roles,
        "userId": user.get("sub"),
        "email": user.get("email"),
        "message": "Admin access granted" if is_admin else "Regular user"
    }

# ============ DASHBOARD STATS ============

@router.get("/dashboard")
async def admin_dashboard(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get admin dashboard statistics"""
    
    # Total users (from user_activity)
    total_users = db.query(UserActivity.user_id).distinct().count()
    
    # Total bookings
    total_bookings = db.query(Booking).count()
    
    # Total revenue (paid bookings only)
    total_revenue = db.query(func.sum(Booking.total_price)).filter(
        Booking.payment_status == "paid"
    ).scalar() or 0
    
    # Recent bookings (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_bookings = db.query(Booking).filter(
        Booking.created_at >= thirty_days_ago
    ).count()
    
    # Pending bookings
    pending_bookings = db.query(Booking).filter(
        Booking.booking_status == "pending"
    ).count()
    
    # Total wishlist items
    total_wishlist = db.query(Wishlist).count()
    
    # Popular destinations (by booking count)
    popular_destinations = db.query(
        Booking.destination_name,
        func.count(Booking.id).label('count')
    ).group_by(Booking.destination_name).order_by(desc('count')).limit(5).all()
    
    # Monthly revenue trend (last 6 months)
    monthly_revenue = db.query(
        func.date_format(Booking.created_at, '%Y-%m').label('month'),
        func.sum(Booking.total_price).label('revenue')
    ).filter(Booking.payment_status == "paid").group_by('month').order_by('month').limit(6).all()
    
    # Daily bookings (last 7 days)
    daily_bookings = db.query(
        func.date(Booking.created_at).label('date'),
        func.count(Booking.id).label('count')
    ).filter(Booking.created_at >= datetime.now() - timedelta(days=7)).group_by('date').all()
    
    return {
        "success": True,
        "stats": {
            "total_users": total_users,
            "total_bookings": total_bookings,
            "total_revenue": float(total_revenue),
            "recent_bookings": recent_bookings,
            "pending_bookings": pending_bookings,
            "total_wishlist": total_wishlist,
            "popular_destinations": [
                {"name": d[0] if d[0] else "Unknown", "bookings": d[1]} for d in popular_destinations
            ],
            "monthly_revenue": [
                {"month": m[0], "revenue": float(m[1])} for m in monthly_revenue
            ],
            "daily_bookings": [
                {"date": str(d[0]), "count": d[1]} for d in daily_bookings
            ]
        }
    }

# ============ DESTINATION MANAGEMENT ============

@router.get("/destinations")
async def admin_get_destinations(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get all destinations for admin"""
    destinations = db.query(Destination).order_by(Destination.id).all()
    
    return {
        "success": True,
        "destinations": [d.to_dict() for d in destinations],
        "total": len(destinations)
    }

@router.get("/destinations/{dest_id}")
async def admin_get_destination(
    dest_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get single destination for editing"""
    destination = db.query(Destination).filter(Destination.id == dest_id).first()
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    return {"success": True, "destination": destination.to_dict()}

@router.post("/destinations")
async def admin_create_destination(
    dest: DestinationCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Create new destination"""
    
    new_dest = Destination(
        name=dest.name,
        location=dest.location,
        region=dest.region,
        lat=dest.lat,
        lng=dest.lng,
        price=dest.price,
        price_label=dest.price_label,
        rating=4.5,
        reviews=0,
        category=dest.category,
        tag=dest.category,
        tag_color="bg-blue-500",
        photo_url=dest.photo_url,
        description=dest.description,
        features=dest.features,
        ai_reason=f"Experience the beauty of {dest.name} in Botswana.",
        match_score=85
    )
    
    db.add(new_dest)
    db.commit()
    db.refresh(new_dest)
    
    return {"success": True, "message": "Destination created", "destination": new_dest.to_dict()}

@router.put("/destinations/{dest_id}")
async def admin_update_destination(
    dest_id: int,
    update: DestinationUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Update destination"""
    
    destination = db.query(Destination).filter(Destination.id == dest_id).first()
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    for field, value in update.dict(exclude_unset=True).items():
        if value is not None:
            setattr(destination, field, value)
    
    db.commit()
    db.refresh(destination)
    
    return {"success": True, "message": "Destination updated", "destination": destination.to_dict()}

@router.delete("/destinations/{dest_id}")
async def admin_delete_destination(
    dest_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Delete destination"""
    
    destination = db.query(Destination).filter(Destination.id == dest_id).first()
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    # Also remove from wishlists
    db.query(Wishlist).filter(Wishlist.destination_id == dest_id).delete()
    
    db.delete(destination)
    db.commit()
    
    return {"success": True, "message": "Destination deleted"}

# ============ BOOKINGS MANAGEMENT ============

@router.get("/bookings")
async def admin_get_bookings(
    status: Optional[str] = Query(None),
    limit: int = Query(50),
    offset: int = Query(0),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get all bookings for admin"""
    
    query = db.query(Booking)
    
    if status:
        query = query.filter(Booking.booking_status == status)
    
    total = query.count()
    bookings = query.order_by(Booking.created_at.desc()).offset(offset).limit(limit).all()
    
    result = []
    for booking in bookings:
        result.append({
            "id": booking.id,
            "booking_reference": booking.booking_reference,
            "user_id": booking.user_id,
            "destination_name": booking.destination_name,
            "check_in": booking.check_in.strftime("%Y-%m-%d"),
            "check_out": booking.check_out.strftime("%Y-%m-%d"),
            "nights": booking.nights,
            "guests": booking.guests,
            "total_price": float(booking.total_price),
            "payment_status": booking.payment_status,
            "booking_status": booking.booking_status,
            "created_at": booking.created_at.isoformat()
        })
    
    return {
        "success": True,
        "bookings": result,
        "total": total,
        "limit": limit,
        "offset": offset
    }

@router.get("/bookings/{booking_id}")
async def admin_get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get single booking details"""
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {
        "success": True,
        "booking": {
            "id": booking.id,
            "booking_reference": booking.booking_reference,
            "user_id": booking.user_id,
            "destination_name": booking.destination_name,
            "check_in": booking.check_in.strftime("%Y-%m-%d"),
            "check_out": booking.check_out.strftime("%Y-%m-%d"),
            "nights": booking.nights,
            "guests": booking.guests,
            "total_price": float(booking.total_price),
            "payment_status": booking.payment_status,
            "booking_status": booking.booking_status,
            "created_at": booking.created_at.isoformat()
        }
    }

@router.put("/bookings/{booking_id}")
async def admin_update_booking(
    booking_id: int,
    update: BookingUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Update booking status"""
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if update.booking_status:
        booking.booking_status = update.booking_status
    if update.payment_status:
        booking.payment_status = update.payment_status
    
    db.commit()
    
    return {"success": True, "message": "Booking updated", "booking_status": booking.booking_status}

# ============ USERS MANAGEMENT ============

@router.get("/users")
async def admin_get_users(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get all users from activity"""
    
    # Get unique users from activity
    users_data = db.query(UserActivity.user_id).distinct().all()
    
    result = []
    for u in users_data:
        user_id = u[0]
        
        # Get user activity count
        activity_count = db.query(UserActivity).filter(UserActivity.user_id == user_id).count()
        
        # Get user bookings
        bookings = db.query(Booking).filter(Booking.user_id == user_id).all()
        booking_count = len(bookings)
        total_spent = sum(b.total_price or 0 for b in bookings)
        
        # Get user preferences
        prefs = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
        
        # Get last active
        last_active = db.query(UserActivity.created_at).filter(
            UserActivity.user_id == user_id
        ).order_by(desc(UserActivity.created_at)).first()
        
        result.append({
            "user_id": user_id,
            "activity_count": activity_count,
            "booking_count": booking_count,
            "total_spent": float(total_spent),
            "preferences": {
                "wildlife": prefs.wildlife if prefs else 0.5,
                "culture": prefs.culture if prefs else 0.5,
                "adventure": prefs.adventure if prefs else 0.5
            } if prefs else None,
            "last_active": last_active[0].isoformat() if last_active else None
        })
    
    return {"success": True, "users": result}

@router.get("/users/{user_id}")
async def admin_get_user_detail(
    user_id: str,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get detailed user information"""
    
    # Get user bookings
    bookings = db.query(Booking).filter(Booking.user_id == user_id).all()
    
    # Get user activity
    activities = db.query(UserActivity).filter(UserActivity.user_id == user_id).order_by(
        desc(UserActivity.created_at)
    ).limit(20).all()
    
    # Get user preferences
    prefs = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    
    return {
        "success": True,
        "user": {
            "user_id": user_id,
            "total_spent": sum(b.total_price or 0 for b in bookings),
            "booking_count": len(bookings),
            "bookings": [
                {
                    "reference": b.booking_reference,
                    "destination": b.destination_name,
                    "date": b.created_at.isoformat(),
                    "total": float(b.total_price),
                    "status": b.booking_status
                } for b in bookings
            ],
            "recent_activity": [
                {
                    "action": a.action_type.value if hasattr(a.action_type, 'value') else str(a.action_type),
                    "created_at": a.created_at.isoformat()
                } for a in activities
            ],
            "preferences": {
                "wildlife": prefs.wildlife if prefs else 0.5,
                "culture": prefs.culture if prefs else 0.5,
                "adventure": prefs.adventure if prefs else 0.5,
                "budget": prefs.budget if prefs else "mid"
            } if prefs else None
        }
    }

# ============ WILDLIFE MANAGEMENT ============

@router.get("/wildlife/sightings")
async def admin_get_wildlife_sightings(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get all wildlife sightings"""
    
    sightings = db.query(WildlifeSighting).all()
    
    result = []
    for s in sightings:
        dest = db.query(Destination).filter(Destination.id == s.destination_id).first()
        result.append({
            "id": s.id,
            "destination_id": s.destination_id,
            "destination_name": dest.name if dest else "Unknown",
            "animal_name": s.animal_name,
            "animal_category": s.animal_category,
            "best_months": s.best_months,
            "best_hours_start": s.best_hours_start,
            "best_hours_end": s.best_hours_end,
            "probability_rating": s.probability_rating,
            "viewing_tips": s.viewing_tips,
            "habitat": s.habitat
        })
    
    return {"success": True, "sightings": result}

@router.post("/wildlife/sightings")
async def admin_create_wildlife_sighting(
    sighting: WildlifeSightingCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Create new wildlife sighting"""
    
    new_sighting = WildlifeSighting(**sighting.dict())
    db.add(new_sighting)
    db.commit()
    db.refresh(new_sighting)
    
    return {"success": True, "message": "Wildlife sighting created", "sighting_id": new_sighting.id}

@router.put("/wildlife/sightings/{sighting_id}")
async def admin_update_wildlife_sighting(
    sighting_id: int,
    update: dict,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Update wildlife sighting"""
    
    sighting = db.query(WildlifeSighting).filter(WildlifeSighting.id == sighting_id).first()
    if not sighting:
        raise HTTPException(status_code=404, detail="Sighting not found")
    
    for field, value in update.items():
        if value is not None and hasattr(sighting, field):
            setattr(sighting, field, value)
    
    db.commit()
    
    return {"success": True, "message": "Wildlife sighting updated"}

@router.get("/wildlife/calendar")
async def admin_get_wildlife_calendar(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get wildlife calendar for admin"""
    
    calendar = db.query(WildlifeCalendar).order_by(WildlifeCalendar.month).all()
    
    result = []
    for c in calendar:
        result.append({
            "month": c.month,
            "month_name": c.month_name,
            "events": c.events,
            "wildlife_rating": c.wildlife_rating,
            "pros": c.pros,
            "cons": c.cons,
            "avg_temp_high": c.avg_temp_high,
            "avg_temp_low": c.avg_temp_low,
            "rainfall_mm": c.rainfall_mm,
            "season_type": c.season_type
        })
    
    return {"success": True, "calendar": result}

@router.put("/wildlife/calendar/{month}")
async def admin_update_wildlife_calendar(
    month: int,
    update: WildlifeCalendarUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Update wildlife calendar for a specific month"""
    
    calendar = db.query(WildlifeCalendar).filter(WildlifeCalendar.month == month).first()
    if not calendar:
        raise HTTPException(status_code=404, detail="Month not found")
    
    calendar.wildlife_rating = update.wildlife_rating
    calendar.events = update.events
    calendar.pros = update.pros
    calendar.cons = update.cons
    calendar.season_type = update.season_type
    
    db.commit()
    
    return {"success": True, "message": "Calendar updated"}

# ============ ANALYTICS ============

@router.get("/analytics/revenue")
async def admin_revenue_analytics(
    period: str = Query("month"),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get revenue analytics"""
    
    if period == "month":
        revenue_by_month = db.query(
            func.date_format(Booking.created_at, '%Y-%m').label('month'),
            func.sum(Booking.total_price).label('revenue'),
            func.count(Booking.id).label('bookings')
        ).filter(Booking.payment_status == "paid").group_by('month').order_by('month').all()
        
        return {
            "success": True,
            "data": [
                {"period": r[0], "revenue": float(r[1]), "bookings": r[2]} 
                for r in revenue_by_month
            ]
        }
    
    return {"success": True, "data": []}

# ============ NOTIFICATIONS ============

@router.get("/notifications")
async def admin_get_notifications(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get recent notifications for admin"""
    
    # Get recent bookings (last 7 days)
    recent_bookings = db.query(Booking).filter(
        Booking.created_at >= datetime.now() - timedelta(days=7)
    ).order_by(desc(Booking.created_at)).limit(10).all()
    
    notifications = []
    
    for booking in recent_bookings:
        notifications.append({
            "id": booking.id,
            "type": "booking",
            "title": "New Booking",
            "message": f"{booking.destination_name} - P{booking.total_price}",
            "time": booking.created_at.isoformat(),
            "read": False,
            "booking_reference": booking.booking_reference
        })
    
    return {"success": True, "notifications": notifications}