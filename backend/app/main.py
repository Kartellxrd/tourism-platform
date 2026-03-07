# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routes.wishlist import router as wishlist_router

# ── Create all tables on startup (safe — skips existing tables) ───────────────
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pula Tourism API",
    description="Intelligent Tourism Booking & Recommendation Platform — Botswana",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],   # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(wishlist_router)

# ── Health check endpoints (keep your existing ones) ─────────────────────────
@app.get("/")
def read_root():
    return {"message": "Welcome to the Botswana Tourism API"}

@app.get("/test-connection")
def test_connection():
    return {"status": "Connected", "message": "Backend is ready!"}