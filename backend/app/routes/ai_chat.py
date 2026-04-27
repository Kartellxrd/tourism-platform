from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
import json
import re
from datetime import datetime, timedelta

from ..database import get_db
from ..models.destination import Destination
from ..models.user_activity import UserActivity
from ..models.wishlist import Wishlist
from ..models.booking import Booking
from .wishlist import get_current_user

router = APIRouter(prefix="/ai/chat", tags=["AI Chat"])

# Intent patterns
INTENTS = {
    "book": {
        "keywords": ["book", "reserve", "book me", "i want to book", "make a booking", "book a trip"],
    },
    "recommend": {
        "keywords": ["recommend", "suggest", "what should i", "where should i", "best places", "top attractions"],
    },
    "weather": {
        "keywords": ["weather", "temperature", "forecast", "rain", "sunny", "hot", "cold", "climate"],
    },
    "best_time": {
        "keywords": ["best time", "when to go", "season", "busy season", "peak season", "off season"],
    },
    "price": {
        "keywords": ["price", "cost", "cheap", "expensive", "budget", "how much", "affordable"],
    },
    "info": {
        "keywords": ["what is", "tell me about", "information", "details about", "more about"],
    }
}

def get_user_preferences(db: Session, user_id: str):
    """Get user preferences from activity"""
    preferences = {
        "categories": [],
        "price_range": "mid",
    }
    
    # Get user's wishlist
    wishlist = db.query(Wishlist).filter(Wishlist.keycloak_user_id == user_id).all()
    wishlist_ids = [w.destination_id for w in wishlist]
    
    if wishlist_ids:
        categories = db.query(Destination.category, func.count(Destination.id)).filter(
            Destination.id.in_(wishlist_ids)
        ).group_by(Destination.category).all()
        preferences["categories"] = [c[0] for c in categories if c[0]]
    
    return preferences

def search_destinations(query, db, preferences=None, lat=None, lng=None):
    """Search destinations based on query"""
    keywords = re.findall(r'\b\w+\b', query.lower())
    
    category_map = {
        "safari": "Wildlife", "wildlife": "Wildlife", "game": "Wildlife",
        "museum": "Culture", "culture": "Culture", "history": "Historical",
        "shopping": "Shopping", "mall": "Shopping", "adventure": "Adventure"
    }
    
    detected_category = None
    for kw in keywords:
        if kw in category_map:
            detected_category = category_map[kw]
            break
    
    dest_query = db.query(Destination).filter(Destination.is_active == True)
    
    if detected_category:
        dest_query = dest_query.filter(Destination.category == detected_category)
    
    if len(query) > 2:
        dest_query = dest_query.filter(Destination.name.like(f"%{query[:20]}%"))
    
    destinations = dest_query.limit(5).all()
    
    if not destinations:
        destinations = db.query(Destination).filter(Destination.is_active == True).limit(5).all()
    
    results = []
    for dest in destinations:
        match_score = 70
        if detected_category and dest.category == detected_category:
            match_score += 15
        if dest.rating and dest.rating >= 4.5:
            match_score += 10
        if dest.price == 0:
            match_score += 5
        
        results.append({
            "id": dest.id,
            "name": dest.name,
            "category": dest.category,
            "rating": float(dest.rating) if dest.rating else 4.0,
            "reviews": dest.reviews,
            "price": float(dest.price) if dest.price else 0,
            "price_label": dest.price_label or "FREE",
            "location": dest.location,
            "photo": dest.photo_url,
            "match_score": min(98, match_score),
        })
    
    return results

def detect_intent(query):
    """Detect user intent"""
    query_lower = query.lower()
    for intent, config in INTENTS.items():
        for keyword in config["keywords"]:
            if keyword in query_lower:
                return intent
    return "general"

def generate_response(intent, destinations, preferences, query):
    """Generate response based on intent"""
    
    if intent == "book" and destinations:
        top_dest = destinations[0]
        return {
            "response": f"🎟️ I found **{top_dest['name']}** which matches your request!\n\n📍 {top_dest['location']}\n⭐ {top_dest['rating']} ({top_dest['reviews']} reviews)\n💰 {top_dest['price_label']} - P{top_dest['price']}/person\n\nWould you like me to book this for you?",
            "action": "ready_to_book",
            "booking_data": {
                "destination_id": top_dest['id'],
                "name": top_dest['name'],
                "price": top_dest['price'],
                "guests": 2,
                "date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
            },
            "dest_id": top_dest['id']
        }
    
    elif intent == "recommend" and destinations:
        response = f"🔍 Based on your preferences, here are my top recommendations:\n\n"
        for i, dest in enumerate(destinations[:3], 1):
            response += f"**{i}. {dest['name']}** ({dest['match_score']}% match)\n📍 {dest['location']} | ⭐ {dest['rating']} | {dest['price_label']}\n\n"
        response += "Would you like to book any of these?"
        
        return {
            "response": response,
            "action": "show_recommendations",
            "recommendations": destinations[:3],
            "dest_id": destinations[0]['id'] if destinations else None
        }
    
    elif intent == "best_time":
        return {
            "response": "📅 **Best time to visit Botswana:**\n\n• **May-October (Dry Season)** - Best for wildlife viewing, animals gather at water sources\n• **November-April (Wet Season)** - Lush landscapes, bird watching, lower prices\n\nWant me to find activities for your preferred month?",
            "action": None
        }
    
    elif intent == "price":
        if destinations:
            return {
                "response": f"💰 **{destinations[0]['name']}**: {destinations[0]['price_label']} - P{destinations[0]['price']}/person\n\nWould you like to book this?",
                "action": "ready_to_book",
                "booking_data": {
                    "destination_id": destinations[0]['id'],
                    "name": destinations[0]['name'],
                    "price": destinations[0]['price']
                }
            }
        else:
            return {
                "response": "💰 **Price Guide:**\n• Budget: P500-1000/day\n• Mid-range: P1000-2500/day\n• Luxury: P2500+/day\n\nWhich budget suits you best?",
                "action": None
            }
    
    else:
        return {
            "response": f"👋 I understand you're interested in: **{query}**\n\nHere's what I can help with:\n• 📍 **Book a trip** - Say 'book me a safari'\n• 🔍 **Get recommendations** - Tell me your interests\n• 📅 **Best times to visit** - Ask about seasons\n• 💰 **Price information** - Check costs\n\nWhat would you like to do?",
            "action": None
        }

@router.post("/")
async def ai_chat(
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """AI Chat endpoint"""
    data = await request.json()
    user_message = data.get("message", "")
    user_id = user.get("id") or user.get("sub", "demo_user")
    
    # Get user preferences
    preferences = get_user_preferences(db, user_id)
    
    # Detect intent
    intent = detect_intent(user_message)
    
    # Search for destinations
    destinations = search_destinations(user_message, db, preferences)
    
    # Generate response
    response_data = generate_response(intent, destinations, preferences, user_message)
    
    # Log activity
    try:
        activity = UserActivity(
            user_id=user_id,
            action_type="chat",
            action_details={"message": user_message, "intent": intent}
        )
        db.add(activity)
        db.commit()
    except:
        pass
    
    return response_data

@router.post("/create-booking")
async def create_booking_from_ai(
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Create booking from AI chat"""
    data = await request.json()
    user_id = user.get("id") or user.get("sub", "demo_user")
    
    destination_id = data.get("destination_id")
    check_in = data.get("check_in")
    guests = data.get("guests", 2)
    
    if not destination_id:
        raise HTTPException(status_code=400, detail="Missing destination_id")
    
    destination = db.query(Destination).filter(Destination.id == destination_id).first()
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    booking_ref = f"BOK_{datetime.now().strftime('%Y%m%d')}_{str(destination_id)[:4]}"
    
    new_booking = Booking(
        booking_reference=booking_ref,
        keycloak_user_id=user_id,
        destination_id=destination_id,
        check_in=datetime.strptime(check_in, "%Y-%m-%d") if check_in else datetime.now(),
        adults=guests,
        total_amount=destination.price or 0,
        status="confirmed",
        payment_status="pending" if destination.price > 0 else "free",
        booking_data={"source": "ai_chat", "guests": guests}
    )
    
    db.add(new_booking)
    db.commit()
    
    return {
        "success": True,
        "booking_reference": booking_ref,
        "total_price": destination.price or 0,
        "destination_name": destination.name,
        "message": f"Booking confirmed for {destination.name}!"
    }