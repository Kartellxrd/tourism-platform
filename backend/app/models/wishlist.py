# backend/app/models/wishlist.py

from sqlalchemy import (
    Column, Integer, String, Text, DateTime,
    JSON, DECIMAL, UniqueConstraint, Index
)
from sqlalchemy.sql import func
from database import Base


class Wishlist(Base):
    __tablename__ = "wishlist"

    id             = Column(Integer, primary_key=True, autoincrement=True)
    user_id        = Column(String(255), nullable=False)   # Keycloak sub (UUID)
    destination_id = Column(Integer, nullable=False)
    name           = Column(String(255), nullable=False)
    location       = Column(String(255), nullable=False)
    region         = Column(String(100))
    price          = Column(Integer, nullable=False)
    price_label    = Column(String(50))
    rating         = Column(DECIMAL(2, 1))
    reviews        = Column(Integer, default=0)
    category       = Column(String(100))
    tag            = Column(String(100))
    tag_color      = Column(String(100))
    photo          = Column(String(500))
    gradient       = Column(String(200))
    description    = Column(Text)
    features       = Column(JSON)          # e.g. ["Wildlife", "Photography"]
    ai_reason      = Column(String(500))
    match_score    = Column(Integer, default=0)
    saved_at       = Column(DateTime, server_default=func.now())

    __table_args__ = (
        # One user can only save the same destination once
        UniqueConstraint("user_id", "destination_id", name="uq_user_destination"),
        Index("ix_wishlist_user_id", "user_id"),
    )