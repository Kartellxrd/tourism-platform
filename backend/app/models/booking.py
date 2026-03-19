# backend/app/models/booking.py

from sqlalchemy import Column, Integer, String, Date, Text, DECIMAL, DateTime
from sqlalchemy.sql import func
from database import Base

class Booking(Base):
    __tablename__ = "bookings"

    id               = Column(Integer, primary_key=True, autoincrement=True)
    user_id          = Column(String(255), nullable=False)
    dest_id          = Column(Integer, nullable=False)
    dest_name        = Column(String(255), nullable=False)
    dest_location    = Column(String(255))
    dest_photo       = Column(String(500))
    dest_gradient    = Column(String(200))
    check_in         = Column(Date, nullable=False)
    check_out        = Column(Date, nullable=False)
    nights           = Column(Integer, nullable=False)
    guests           = Column(Integer, default=1)
    price_per_person = Column(DECIMAL(10,2), nullable=False)
    total_price      = Column(DECIMAL(10,2), nullable=False)
    status           = Column(String(50), default='pending')
    payment_status   = Column(String(50), default='unpaid')
    payment_intent   = Column(String(255))
    special_requests = Column(Text)
    created_at       = Column(DateTime, server_default=func.now())