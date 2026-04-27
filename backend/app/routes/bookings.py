from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime, date
import secrets
import json

from ..database import get_db
from ..models.destination import Destination
from ..models.booking import Booking
from .wishlist import get_current_user

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

@router.get("/user")
async def get_user_bookings(
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get user's bookings"""
    user_id = user.get("id") or user.get("sub", "demo_user_123")
    
    try:
        # Query bookings from database
        bookings = db.query(Booking).filter(Booking.keycloak_user_id == user_id).all()
        
        result = []
        for booking in bookings:
            # Get destination details
            destination = db.query(Destination).filter(Destination.id == booking.destination_id).first()
            
            # Calculate nights
            nights = 1
            if booking.check_in and booking.check_out:
                nights = max(1, (booking.check_out - booking.check_in).days)
            
            # Safely get booking_data
            booking_data = {}
            if booking.booking_data:
                if isinstance(booking.booking_data, str):
                    booking_data = json.loads(booking.booking_data)
                else:
                    booking_data = booking.booking_data
            
            result.append({
                "id": booking.id,
                "booking_reference": booking.booking_reference,
                "destination_id": booking.destination_id,
                "destination_name": destination.name if destination else "Unknown",
                "destination_location": destination.location if destination else "Botswana",
                "destination_photo": destination.photo_url if destination else None,
                "check_in": booking.check_in.strftime("%Y-%m-%d") if booking.check_in else None,
                "check_out": booking.check_out.strftime("%Y-%m-%d") if booking.check_out else None,
                "nights": nights,
                "guests": booking.adults or 1,
                "vehicles": booking.vehicles or 0,
                "rooms": booking.rooms or 1,
                "total_price": float(booking.total_amount) if booking.total_amount else 0,
                "booking_status": booking.status,
                "payment_status": booking.payment_status,
                "payment_method": booking_data.get("payment_method", "card"),
                "created_at": booking.created_at.isoformat() if booking.created_at else None
            })
        
        return {"bookings": result}
    except Exception as e:
        print(f"Error getting bookings: {str(e)}")
        return {"bookings": []}

@router.post("/create")
async def create_booking(
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Create a new booking"""
    try:
        data = await request.json()
        user_id = user.get("id") or user.get("sub", "demo_user_123")
        
        # Generate unique booking reference
        booking_ref = f"BOK_{datetime.now().strftime('%Y%m%d')}_{secrets.token_hex(3).upper()}"
        
        # Parse dates
        check_in = None
        check_out = None
        if data.get("check_in"):
            check_in = datetime.strptime(data.get("check_in"), "%Y-%m-%d").date()
        if data.get("check_out"):
            check_out = datetime.strptime(data.get("check_out"), "%Y-%m-%d").date()
        
        # Determine status based on payment
        total_amount = data.get("total_amount", 0)
        if total_amount == 0:
            status = "confirmed"
            payment_status = "free"
        else:
            status = "confirmed"
            payment_status = "paid"
        
        new_booking = Booking(
            booking_reference=data.get("booking_reference") or booking_ref,
            keycloak_user_id=user_id,
            destination_id=data.get("destination_id"),
            check_in=check_in,
            check_out=check_out,
            adults=data.get("guests", 1),
            vehicles=data.get("vehicles", 0),
            rooms=data.get("rooms", 1),
            total_amount=total_amount,
            booking_data={
                "payment_method": data.get("payment_method", "card"),
                "special_requests": data.get("special_requests", ""),
                "payment_intent_id": data.get("payment_intent_id")
            },
            status=status,
            payment_status=payment_status
        )
        
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)
        
        return {
            "success": True,
            "booking_reference": new_booking.booking_reference,
            "message": "Booking created successfully"
        }
    except Exception as e:
        print(f"Error creating booking: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{booking_id}")
async def cancel_booking(
    booking_id: int,
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Cancel a booking"""
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        booking.status = "cancelled"
        db.commit()
        
        return {"success": True, "message": "Booking cancelled"}
    except Exception as e:
        print(f"Error cancelling booking: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))