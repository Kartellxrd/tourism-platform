"""
Run this file once to populate your database with real destinations
Including Gaborone area for the "Near Me" feature
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.destination import Destination

# All destinations including Gaboronne area
DESTINATIONS = [
    # GABORONE AREA (For "Near Me" feature when at UB)
    {
        "name": "Gaborone Game Reserve",
        "location": "Gaborone",
        "region": "South-East",
        "lat": -24.6472,
        "lng": 25.9081,
        "price": 30,
        "price_label": "P30 entry",
        "rating": 4.3,
        "reviews": 847,
        "category": "Wildlife",
        "tag": "City Safari",
        "tag_color": "bg-green-500",
        "photo_url": "https://images.unsplash.com/photo-1547471080-7cc2caa01b4e",
        "gradient": "from-green-900/80 to-emerald-900/60",
        "description": "Wildlife reserve within Gaborone city limits. See zebras, ostriches, and more without leaving town.",
        "features": ["Game drives", "Picnic spots", "Bird watching", "Walking trails"],
        "ai_reason": "Perfect for a quick wildlife fix - only 8km from UB!",
        "match_score": 94,
        "place_id": None
    },
    {
        "name": "National Museum & Art Gallery",
        "location": "Gaborone",
        "region": "South-East",
        "lat": -24.6581,
        "lng": 25.9165,
        "price": 0,
        "price_label": "Free entry",
        "rating": 4.5,
        "reviews": 342,
        "category": "Culture",
        "tag": "Free Entry",
        "tag_color": "bg-purple-500",
        "photo_url": "https://images.unsplash.com/photo-1566127444979-5e3e8f2f9d4a",
        "gradient": "from-purple-900/80 to-indigo-900/60",
        "description": "Botswana's history, art, and culture under one roof. Traditional crafts and contemporary exhibits.",
        "features": ["Art exhibits", "History displays", "Traditional crafts", "Gift shop"],
        "ai_reason": "Free cultural experience - just 2.7km from campus!",
        "match_score": 89,
        "place_id": None
    },
    {
        "name": "Three Dikgosi Monument",
        "location": "Gaborone",
        "region": "South-East",
        "lat": -24.6578,
        "lng": 25.9194,
        "price": 0,
        "price_label": "Free",
        "rating": 4.7,
        "reviews": 521,
        "category": "Historical",
        "tag": "Landmark",
        "tag_color": "bg-amber-500",
        "photo_url": "https://images.unsplash.com/photo-1571040587101-7ef1a6c3c837",
        "gradient": "from-amber-900/80 to-orange-900/60",
        "description": "Iconic statues honoring Botswana's three founding fathers who sought independence from Britain.",
        "features": ["Photo spot", "Historical significance", "Central location"],
        "ai_reason": "Must-see landmark - walking distance from UB!",
        "match_score": 92,
        "place_id": None
    },
    {
        "name": "Mokolodi Nature Reserve",
        "location": "Gaborone",
        "region": "South-East",
        "lat": -24.7417,
        "lng": 25.8172,
        "price": 150,
        "price_label": "P150 entry",
        "rating": 4.6,
        "reviews": 1124,
        "category": "Wildlife",
        "tag": "Rhino Tracking",
        "tag_color": "bg-emerald-500",
        "photo_url": "https://images.unsplash.com/photo-1516426122078-c23e76319801",
        "gradient": "from-emerald-900/80 to-teal-900/60",
        "description": "Private reserve with rhino tracking, night drives, and cheetah encounters.",
        "features": ["Rhino tracking", "Night drives", "Cheetah encounters", "Education center"],
        "ai_reason": "Best wildlife experience near Gaborone - 15km from UB",
        "match_score": 91,
        "place_id": None
    },
    {
        "name": "Riverwalk Mall",
        "location": "Gaborone",
        "region": "South-East",
        "lat": -24.6158,
        "lng": 25.8489,
        "price": 0,
        "price_label": "Free entry",
        "rating": 4.2,
        "reviews": 1234,
        "category": "Shopping",
        "tag": "Shopping",
        "tag_color": "bg-blue-500",
        "photo_url": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205",
        "gradient": "from-blue-900/80 to-cyan-900/60",
        "description": "Modern shopping center with cinema, restaurants, and retail stores.",
        "features": ["Cinema", "Restaurants", "Retail stores", "Parking"],
        "ai_reason": "Great for weekend shopping - 6km from campus",
        "match_score": 76,
        "place_id": None
    },
    
    # FAMOUS BOTSWANA DESTINATIONS (Your original 10+)
    {
        "name": "Okavango Delta",
        "location": "Maun",
        "region": "North-West",
        "lat": -19.014,
        "lng": 23.095,
        "price": 4500,
        "price_label": "from P4,500/night",
        "rating": 4.9,
        "reviews": 2847,
        "category": "Wildlife",
        "tag": "Most Popular",
        "tag_color": "bg-amber-500",
        "photo_url": "https://images.unsplash.com/photo-1547471080-7cc2caa01b4e",
        "gradient": "from-emerald-900/80 to-teal-900/60",
        "description": "The Okavango Delta is a vast inland river delta in northern Botswana.",
        "features": ["Mokoro Rides", "Big 5 Safari", "Bird Watching", "Luxury Camps"],
        "ai_reason": "Perfect match for wildlife lovers",
        "match_score": 97,
        "place_id": None
    },
    {
        "name": "Chobe National Park",
        "location": "Kasane",
        "region": "North-East",
        "lat": -18.6667,
        "lng": 24.5,
        "price": 5100,
        "price_label": "from P5,100/night",
        "rating": 4.8,
        "reviews": 2156,
        "category": "Wildlife",
        "tag": "Elephant Paradise",
        "tag_color": "bg-emerald-500",
        "photo_url": "https://images.unsplash.com/photo-1564767655709-ead7062d84c9",
        "gradient": "from-green-900/80 to-emerald-900/60",
        "description": "Home to Africa's largest elephant population.",
        "features": ["River cruises", "Elephant herds", "Lion sightings", "Bird watching"],
        "ai_reason": "Unmatched elephant viewing experiences",
        "match_score": 96,
        "place_id": None
    },
    {
        "name": "Moremi Game Reserve",
        "location": "Okavango Delta",
        "region": "North-West",
        "lat": -19.1667,
        "lng": 23.1667,
        "price": 4800,
        "price_label": "from P4,800/night",
        "rating": 4.9,
        "reviews": 1892,
        "category": "Wildlife",
        "tag": "Best Safari",
        "tag_color": "bg-green-500",
        "photo_url": "https://images.unsplash.com/photo-1516426122078-c23e76319801",
        "gradient": "from-green-900/80 to-teal-900/60",
        "description": "One of Africa's most beautiful wildlife reserves.",
        "features": ["Big cats", "Wild dogs", "Scenic landscapes", "Camping"],
        "ai_reason": "Incredible predator sightings",
        "match_score": 95,
        "place_id": None
    },
    {
        "name": "Central Kalahari Game Reserve",
        "location": "Ghanzi",
        "region": "Central",
        "lat": -21.9,
        "lng": 23.8,
        "price": 3200,
        "price_label": "from P3,200/night",
        "rating": 4.6,
        "reviews": 1245,
        "category": "Adventure",
        "tag": "Remote Wilderness",
        "tag_color": "bg-orange-500",
        "photo_url": "https://images.unsplash.com/photo-1547471080-7cc2caa01b4e",
        "gradient": "from-orange-900/80 to-amber-900/60",
        "description": "Vast wilderness with unique desert-adapted wildlife.",
        "features": ["Desert wildlife", "Stargazing", "4x4 trails", "Cultural visits"],
        "ai_reason": "For adventurous souls seeking true wilderness",
        "match_score": 88,
        "place_id": None
    },
    {
        "name": "Tsodilo Hills",
        "location": "North-West",
        "region": "North-West",
        "lat": -18.75,
        "lng": 21.75,
        "price": 250,
        "price_label": "P250 entry",
        "rating": 4.7,
        "reviews": 892,
        "category": "Cultural",
        "tag": "UNESCO",
        "tag_color": "bg-purple-500",
        "photo_url": "https://images.unsplash.com/photo-1571040587101-7ef1a6c3c837",
        "gradient": "from-purple-900/80 to-indigo-900/60",
        "description": "UNESCO World Heritage site with ancient rock art.",
        "features": ["Rock paintings", "Hiking trails", "Sacred sites", "Guided tours"],
        "ai_reason": "Ancient history and spiritual significance",
        "match_score": 85,
        "place_id": None
    }
]

def load_destinations():
    """Load all destinations into the database"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Clear existing data (optional)
        db.query(Destination).delete()
        
        # Insert new destinations
        for dest_data in DESTINATIONS:
            destination = Destination(**dest_data)
            db.add(destination)
        
        db.commit()
        print(f"✅ Loaded {len(DESTINATIONS)} destinations into database")
        
        # Verify
        count = db.query(Destination).count()
        print(f"📊 Total destinations in DB: {count}")
        
        # Show Gaborone ones for "Near Me"
        gaborone = db.query(Destination).filter(Destination.region == "South-East").all()
        print(f"📍 Gaborone area destinations: {len(gaborone)}")
        for d in gaborone:
            print(f"   - {d.name} ({d.lat}, {d.lng})")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🌍 Loading Botswana destinations...")
    load_destinations()