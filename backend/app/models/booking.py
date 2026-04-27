from sqlalchemy import Column, Integer, String, Float, JSON, TIMESTAMP, Date, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String(50), unique=True, nullable=False, index=True)
    keycloak_user_id = Column(String(255), nullable=False)
    destination_id = Column(Integer, nullable=False)
    check_in = Column(Date, nullable=True)
    check_out = Column(Date, nullable=True)
    adults = Column(Integer, default=1)
    children = Column(Integer, default=0)
    vehicles = Column(Integer, default=0)
    rooms = Column(Integer, default=1)
    total_amount = Column(Float, default=0)
    booking_data = Column(JSON, default={})
    status = Column(String(50), default="pending")
    payment_status = Column(String(50), default="pending")
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())