from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Text
from sqlalchemy.sql import func
from ..database import Base

class Itinerary(Base):
    __tablename__ = "itineraries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), nullable=False, index=True)
    title = Column(String(255), nullable=True)
    days = Column(Integer, default=3)
    budget = Column(String(50), default='mid')
    interests = Column(JSON, default=[])
    total_cost = Column(Float, default=0)
    daily_plan = Column(JSON, default=[])
    share_token = Column(String(100), unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())