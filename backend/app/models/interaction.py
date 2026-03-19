# backend/app/models/interaction.py

from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base

class Interaction(Base):
    __tablename__ = "interactions"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    user_id    = Column(String(255), nullable=False)
    dest_id    = Column(Integer, nullable=False)
    action     = Column(String(50), nullable=False)
    weight     = Column(Float, default=1.0)
    created_at = Column(DateTime, server_default=func.now())