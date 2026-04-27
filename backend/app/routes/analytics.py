from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta

from ..database import get_db
from ..models.booking import Booking
from ..models.wishlist import Wishlist
from ..models.interaction import Interaction
from ..models.destination import Destination
from ..routes.wishlist import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard")
async def get_dashboard_analytics(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get personalized analytics for user dashboard"""
    
    user_id = user["sub"]
    
    # Booking stats
    bookings = db.query(Booking).filter(Booking.user_id == user_id).all()
    total_bookings = len(bookings)
    total_spent = sum(b.total_price or 0 for b in bookings)
    upcoming_bookings = len([b for b in bookings if b.check_in >= datetime.now().date()])
    
    # Wishlist stats
    wishlist_count = db.query(Wishlist).filter(Wishlist.user_id == user_id).count()
    
    # Interaction stats
    interactions = db.query(Interaction).filter(Interaction.user_id == user_id).all()
    
    # Most viewed destinations
    most_viewed = db.query(
        Interaction.destination_id,
        func.count(Interaction.id).label('view_count')
    ).filter(
        Interaction.user_id == user_id,
        Interaction.action == 'view'
    ).group_by(Interaction.destination_id).order_by(desc('view_count')).limit(5).all()
    
    viewed_destinations = []
    for mv in most_viewed:
        dest = db.query(Destination).filter(Destination.id == mv.destination_id).first()
        if dest:
            viewed_destinations.append({
                "id": dest.id,
                "name": dest.name,
                "view_count": mv.view_count
            })
    
    # Travel patterns
    travel_patterns = {
        "total_bookings": total_bookings,
        "total_spent": total_spent,
        "upcoming_bookings": upcoming_bookings,
        "wishlist_count": wishlist_count,
        "total_interactions": len(interactions),
        "most_viewed": viewed_destinations
    }
    
    # Recommendations based on analytics
    recommendations = []
    if total_bookings == 0:
        recommendations.append("📌 You haven't booked any trips yet. Check out our Explore page!")
    if wishlist_count > 0 and total_bookings == 0:
        recommendations.append(f"❤️ You have {wishlist_count} saved spots. Why not book one?")
    if upcoming_bookings == 0 and wishlist_count > 0:
        recommendations.append("🎯 Book your next adventure from your wishlist!")
    
    return {
        "success": True,
        "stats": travel_patterns,
        "recommendations": recommendations,
        "member_since": "April 2026"  # Could be from user profile
    }


@router.get("/popular")
async def get_popular_destinations(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get most popular destinations based on bookings and wishlists"""
    
    # Get booking counts per destination
    booking_counts = db.query(
        Booking.destination_id,
        func.count(Booking.id).label('booking_count')
    ).group_by(Booking.destination_id).all()
    
    # Get wishlist counts per destination
    wishlist_counts = db.query(
        Wishlist.destination_id,
        func.count(Wishlist.id).label('wishlist_count')
    ).group_by(Wishlist.destination_id).all()
    
    # Combine and score
    popularity_scores = {}
    
    for bc in booking_counts:
        popularity_scores[bc.destination_id] = {
            "bookings": bc.booking_count,
            "wishlists": 0,
            "score": bc.booking_count * 10
        }
    
    for wc in wishlist_counts:
        if wc.destination_id in popularity_scores:
            popularity_scores[wc.destination_id]["wishlists"] = wc.wishlist_count
            popularity_scores[wc.destination_id]["score"] += wc.wishlist_count * 5
        else:
            popularity_scores[wc.destination_id] = {
                "bookings": 0,
                "wishlists": wc.wishlist_count,
                "score": wc.wishlist_count * 5
            }
    
    # Sort by score and get top destinations
    sorted_dests = sorted(popularity_scores.items(), key=lambda x: x[1]["score"], reverse=True)[:limit]
    
    result = []
    for dest_id, scores in sorted_dests:
        dest = db.query(Destination).filter(Destination.id == dest_id).first()
        if dest:
            result.append({
                "id": dest.id,
                "name": dest.name,
                "location": dest.location,
                "rating": float(dest.rating) if dest.rating else None,
                "price": float(dest.price) if dest.price else None,
                "total_bookings": scores["bookings"],
                "total_wishlists": scores["wishlists"],
                "popularity_score": scores["score"]
            })
    
    return {
        "success": True,
        "total": len(result),
        "data": result
    }