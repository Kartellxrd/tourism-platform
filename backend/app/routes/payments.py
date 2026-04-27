from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import stripe
import os
from datetime import datetime
import secrets

from ..database import get_db
from ..models.destination import Destination
from ..models.booking import Booking
from .wishlist import get_current_user

router = APIRouter(prefix="/api/payments", tags=["Payments"])

# Initialize Stripe with your secret key
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@router.post("/create-payment-intent")
async def create_payment_intent(request: Request, db: Session = Depends(get_db)):
    """Create a Stripe Payment Intent"""
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    data = await request.json()
    
    amount = data.get("amount", 0)
    destination_id = data.get("destination_id")
    booking_data = data.get("booking_data", {})
    
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")
    
    try:
        # Create a PaymentIntent
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convert to cents/pula thebe
            currency="bwp",  # Botswana Pula
            metadata={
                "destination_id": str(destination_id),
                "booking_reference": f"BOK_{secrets.token_hex(4).upper()}",
                "check_in": booking_data.get("check_in", ""),
                "check_out": booking_data.get("check_out", ""),
                "guests": str(booking_data.get("guests", 1))
            },
            automatic_payment_methods={
                "enabled": True,
                "allow_redirects": "never"
            }
        )
        
        return {
            "success": True,
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/confirm-booking")
async def confirm_booking(request: Request, db: Session = Depends(get_db)):
    """Confirm booking after successful payment"""
    data = await request.json()
    
    payment_intent_id = data.get("payment_intent_id")
    destination_id = data.get("destination_id")
    booking_details = data.get("booking_details", {})
    user = await get_current_user(request)
    
    try:
        # Verify payment intent
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if intent.status != "succeeded":
            raise HTTPException(status_code=400, detail="Payment not successful")
        
        # Generate unique booking reference
        booking_ref = f"BOK_{datetime.now().strftime('%Y%m%d')}_{secrets.token_hex(3).upper()}"
        
        return {
            "success": True,
            "booking_reference": booking_ref,
            "message": "Booking confirmed successfully"
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))