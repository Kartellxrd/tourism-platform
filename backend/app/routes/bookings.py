# backend/app/routes/bookings.py

import os
import stripe
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

from database import get_db
from models.booking import Booking
from routes.wishlist import get_current_user

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "pk_test_51TCMPDCCKiNxzmzdIpOaXR9vkiB2STEglZAo8fBKSDj8HmSkUmTLLfMEtfB9AfcaO8Je9HkiLkTdG7BdyFrjhqwx00KjJR141z")
FRONTEND_URL   = os.getenv("FRONTEND_URL", "http://localhost:3000")

router = APIRouter(prefix="/bookings", tags=["Bookings"])


# ── Schemas ───────────────────────────────────────────────────────────────────
class BookingCreate(BaseModel):
    dest_id:          int
    dest_name:        str
    dest_location:    Optional[str] = None
    dest_photo:       Optional[str] = None
    dest_gradient:    Optional[str] = None
    check_in:         date
    check_out:        date
    guests:           int           = 1
    price_per_person: float
    special_requests: Optional[str] = None


class BookingOut(BaseModel):
    id:               int
    dest_id:          int
    dest_name:        str
    dest_location:    Optional[str]
    dest_photo:       Optional[str]
    dest_gradient:    Optional[str]
    check_in:         date
    check_out:        date
    nights:           int
    guests:           int
    price_per_person: float
    total_price:      float
    status:           str
    payment_status:   str
    special_requests: Optional[str]
    created_at:       datetime

    class Config:
        from_attributes = True


# ── POST /bookings ─────────────────────────────────────────────────────────────
@router.post("", response_model=dict)
async def create_booking(
    payload: BookingCreate,
    db:      Session = Depends(get_db),
    user:    dict    = Depends(get_current_user),
):
    # Calculate nights and total price
    nights = (payload.check_out - payload.check_in).days
    if nights <= 0:
        raise HTTPException(
            status_code=400,
            detail="Check-out date must be after check-in date"
        )

    total_price = payload.price_per_person * payload.guests * nights

    # Save booking to MySQL with pending status
    booking = Booking(
        user_id          = user["sub"],
        dest_id          = payload.dest_id,
        dest_name        = payload.dest_name,
        dest_location    = payload.dest_location,
        dest_photo       = payload.dest_photo,
        dest_gradient    = payload.dest_gradient,
        check_in         = payload.check_in,
        check_out        = payload.check_out,
        nights           = nights,
        guests           = payload.guests,
        price_per_person = payload.price_per_person,
        total_price      = total_price,
        status           = "pending",
        payment_status   = "unpaid",
        special_requests = payload.special_requests,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Try Stripe checkout
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency":     "bwp",
                    "product_data": {
                        "name":        f"{payload.dest_name} — {nights} night(s)",
                        "description": f"{payload.guests} guest(s) · {payload.check_in} to {payload.check_out}",
                    },
                    "unit_amount": int(total_price * 100),
                },
                "quantity": 1,
            }],
            mode        = "payment",
            success_url = f"{FRONTEND_URL}/dashboard/bookings?success=true&booking_id={booking.id}",
            cancel_url  = f"{FRONTEND_URL}/dashboard/explore?cancelled=true",
            metadata    = {"booking_id": str(booking.id)},
        )

        # Save Stripe session ID
        booking.payment_intent = session.id
        db.commit()

        return {
            "booking_id":   booking.id,
            "checkout_url": session.url,
            "total_price":  float(total_price),
            "nights":       nights,
        }

    except Exception:
        # Stripe not configured — Option A fallback, confirm directly
        booking.status         = "confirmed"
        booking.payment_status = "paid"
        db.commit()

        return {
            "booking_id":   booking.id,
            "checkout_url": None,
            "total_price":  float(total_price),
            "nights":       nights,
        }


# ── GET /bookings ──────────────────────────────────────────────────────────────
@router.get("", response_model=dict)
async def get_bookings(
    db:   Session = Depends(get_db),
    user: dict    = Depends(get_current_user),
):
    bookings = (
        db.query(Booking)
        .filter(Booking.user_id == user["sub"])
        .order_by(Booking.created_at.desc())
        .all()
    )

    return {
        "bookings": [BookingOut.model_validate(b).model_dump() for b in bookings],
        "total":    len(bookings),
    }


# ── PUT /bookings/{booking_id}/confirm ────────────────────────────────────────
@router.put("/{booking_id}/confirm")
async def confirm_booking(
    booking_id: int,
    db:         Session = Depends(get_db),
    user:       dict    = Depends(get_current_user),
):
    booking = db.query(Booking).filter(
        Booking.id      == booking_id,
        Booking.user_id == user["sub"],
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status         = "confirmed"
    booking.payment_status = "paid"
    db.commit()

    return {"message": "Booking confirmed", "booking_id": booking_id}


# ── DELETE /bookings/{booking_id} ─────────────────────────────────────────────
@router.delete("/{booking_id}")
async def cancel_booking(
    booking_id: int,
    db:         Session = Depends(get_db),
    user:       dict    = Depends(get_current_user),
):
    booking = db.query(Booking).filter(
        Booking.id      == booking_id,
        Booking.user_id == user["sub"],
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = "cancelled"
    db.commit()

    return {"message": "Booking cancelled", "booking_id": booking_id}