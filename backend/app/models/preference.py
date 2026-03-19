# backend/app/models/preference.py

from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id           = Column(Integer, primary_key=True, autoincrement=True)
    user_id      = Column(String(255), nullable=False, unique=True)
    wildlife     = Column(Float, default=0.0)
    photography  = Column(Float, default=0.0)
    luxury       = Column(Float, default=0.0)
    adventure    = Column(Float, default=0.0)
    culture      = Column(Float, default=0.0)
    family       = Column(Float, default=0.0)
    water        = Column(Float, default=0.0)
    desert       = Column(Float, default=0.0)
    birding      = Column(Float, default=0.0)
    stargazing   = Column(Float, default=0.0)
    budget       = Column(String(50), default='mid')
    travel_style = Column(String(50), default='solo')
    updated_at   = Column(DateTime, server_default=func.now(), onupdate=func.now())