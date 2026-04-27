from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Boolean
from sqlalchemy.sql import func
from ..database import Base

class WildlifeSighting(Base):
    __tablename__ = "wildlife_sightings"
    
    id = Column(Integer, primary_key=True)
    destination_id = Column(Integer, nullable=False, index=True)
    animal_name = Column(String(100), nullable=False, index=True)
    animal_category = Column(String(50))
    best_months = Column(JSON)
    best_hours_start = Column(Integer, default=6)
    best_hours_end = Column(Integer, default=10)
    probability_rating = Column(Integer, default=70)
    viewing_tips = Column(String(500))
    habitat = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class WildlifeCalendar(Base):
    __tablename__ = "wildlife_calendar"
    
    id = Column(Integer, primary_key=True)
    month = Column(Integer, nullable=False, unique=True)
    month_name = Column(String(20), nullable=False)
    events = Column(JSON)
    wildlife_rating = Column(Integer, default=5)
    pros = Column(JSON)
    cons = Column(JSON)
    avg_temp_high = Column(Float)
    avg_temp_low = Column(Float)
    rainfall_mm = Column(Float)
    season_type = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())