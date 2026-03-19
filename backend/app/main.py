# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routes.wishlist import router as wishlist_router
from routes.preferences import router as preferences_router
from routes.recommendations import router as recommendations_router
from routes.interactions import router as interactions_router
from routes.bookings import router as bookings_router
from routes.ai_query import router as ai_router

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pula Tourism API",
    description="Intelligent Tourism Booking & Recommendation Platform — Botswana",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(wishlist_router)
app.include_router(preferences_router)
app.include_router(recommendations_router)
app.include_router(interactions_router)
app.include_router(bookings_router)
app.include_router(ai_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Botswana Tourism API"}

@app.get("/test-connection")
def test_connection():
    return {"status": "Connected", "message": "Backend is ready!"}