from sqlalchemy import Column, Integer, String, Float, JSON, TIMESTAMP, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class Destination(Base):
    __tablename__ = "destinations"
    
    id = Column(Integer, primary_key=True, index=True)
    google_place_id = Column(String(255), unique=True, nullable=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255))
    region = Column(String(100))
    lat = Column(Float)
    lng = Column(Float)
    price = Column(Float, default=0)
    price_label = Column(String(50), default="FREE")
    rating = Column(Float, default=4.0)
    reviews = Column(Integer, default=0)
    category = Column(String(100))
    tag = Column(String(100))
    tag_color = Column(String(50))
    photo_url = Column(String(500))  # Note: photo_url, not photo
    gradient = Column(String(100))
    description = Column(Text)
    features = Column(JSON, default=list)
    ai_reason = Column(Text)
    match_score = Column(Integer, default=50)
    place_id = Column(String(255))
    extra_data = Column(JSON, default=dict)
    source = Column(String(50), default='google')
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Helper property to match frontend expectations
    @property
    def photo(self):
        return self.photo_url
    
    @property
    def desc(self):
        return self.description