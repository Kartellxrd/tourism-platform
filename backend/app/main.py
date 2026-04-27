from dotenv import load_dotenv
import os

load_dotenv()

# Check API keys
key = os.getenv("GOOGLE_MAPS_API_KEY")
if key:
    print(f"🔑 GOOGLE_MAPS_API_KEY loaded: {key[:10]}...")
else:
    print("❌ GOOGLE_MAPS_API_KEY NOT FOUND")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routes.wishlist import router as wishlist_router
from .routes.preferences import router as preferences_router
from .routes.recommendations import router as recommendations_router
from .routes.interactions import router as interactions_router
from .routes.bookings import router as bookings_router
from .routes.ai_query import router as ai_router
from .routes.ai_chat import router as ai_chat_router  
from .routes.destinations import router as destinations_router
from .routes.nearby import router as nearby_router
from .routes.wildlife import router as wildlife_router
from .routes.analytics import router as analytics_router
from .routes.weather import router as weather_router
from .routes.itinerary import router as itinerary_router
from .routes.admin import router as admin_router
from .routes.notifications import router as notifications_router
from .routes.explore import router as explore_router
from .routes.discovered import router as discovered_router
from .routes.payments import router as payments_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pula Tourism API",
    description="Intelligent Tourism Booking & Recommendation Platform — Botswana",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include all routers
app.include_router(wishlist_router)
app.include_router(preferences_router)
app.include_router(recommendations_router)
app.include_router(interactions_router)
app.include_router(bookings_router)
app.include_router(ai_router)
app.include_router(ai_chat_router)  
app.include_router(destinations_router)  
app.include_router(nearby_router)  
app.include_router(wildlife_router)
app.include_router(analytics_router)
app.include_router(weather_router)
app.include_router(itinerary_router)
app.include_router(admin_router)
app.include_router(notifications_router)
app.include_router(explore_router)
app.include_router(discovered_router)
app.include_router(payments_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Botswana Tourism API"}

@app.get("/test-connection")
def test_connection():
    return {"status": "Connected", "message": "Backend is ready!"}