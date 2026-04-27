from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
import httpx
from datetime import datetime
import os

from ..database import get_db
from ..models.destination import Destination

router = APIRouter(prefix="/weather", tags=["Weather Intelligence"])

# Free weather API (OpenWeatherMap - free tier)
# Sign up at https://openweathermap.org/api for free API key
WEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")


@router.get("/current")
async def get_current_weather(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    destination_id: int = Query(None, description="Optional destination ID")
):
    """Get current weather for a location"""
    
    if WEATHER_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"https://api.openweathermap.org/data/2.5/weather",
                    params={
                        "lat": lat,
                        "lon": lng,
                        "appid": WEATHER_API_KEY,
                        "units": "metric"
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "temperature": data["main"]["temp"],
                        "feels_like": data["main"]["feels_like"],
                        "condition": data["weather"][0]["description"],
                        "icon": data["weather"][0]["icon"],
                        "humidity": data["main"]["humidity"],
                        "wind_speed": data["wind"]["speed"],
                        "advice": get_weather_advice(data["main"]["temp"], data["weather"][0]["description"])
                    }
        except Exception as e:
            print(f"Weather API error: {e}")
    
    # Fallback: Smart weather estimation based on season
    return get_fallback_weather(lat, lng)


@router.get("/forecast")
async def get_weather_forecast(
    destination_id: int = Query(..., description="Destination ID"),
    days: int = Query(3, ge=1, le=7),
    db: Session = Depends(get_db)
):
    """Get weather forecast for a destination"""
    
    dest = db.query(Destination).filter(Destination.id == destination_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    if WEATHER_API_KEY and dest.lat and dest.lng:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"https://api.openweathermap.org/data/2.5/forecast",
                    params={
                        "lat": float(dest.lat),
                        "lon": float(dest.lng),
                        "appid": WEATHER_API_KEY,
                        "units": "metric",
                        "cnt": days * 8  # 8 forecasts per day
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    forecasts = []
                    for item in data["list"][:days * 8:8]:  # One per day
                        forecasts.append({
                            "date": item["dt_txt"],
                            "temp_high": item["main"]["temp_max"],
                            "temp_low": item["main"]["temp_min"],
                            "condition": item["weather"][0]["description"],
                            "icon": item["weather"][0]["icon"]
                        })
                    return {
                        "success": True,
                        "destination": dest.name,
                        "forecasts": forecasts
                    }
        except Exception as e:
            print(f"Forecast API error: {e}")
    
    return {
        "success": False,
        "message": "Weather forecast unavailable. Please check back later.",
        "destination": dest.name
    }


def get_weather_advice(temp: float, condition: str) -> str:
    """Generate smart weather advice"""
    if temp > 30:
        return "☀️ Hot day! Stay hydrated, wear sunscreen, and plan indoor activities during midday."
    elif temp < 20:
        return "❄️ Cool day! Bring a jacket, especially for early morning game drives."
    elif "rain" in condition.lower():
        return "☔ Rain expected! Indoor activities recommended. Great for museum visits!"
    else:
        return "🌤️ Perfect weather for outdoor activities and game drives!"


def get_fallback_weather(lat: float, lng: float) -> dict:
    """Fallback weather estimation when API is unavailable"""
    current_month = datetime.now().month
    
    # Botswana seasonal patterns
    if 5 <= current_month <= 8:  # Winter/Dry season
        return {
            "success": True,
            "temperature": 22,
            "feels_like": 20,
            "condition": "Clear sky, cool mornings",
            "icon": "01d",
            "humidity": 40,
            "wind_speed": 15,
            "advice": "🥶 Cool mornings! Perfect for game drives. Bring warm clothing."
        }
    elif 9 <= current_month <= 11:  # Spring/Hot season
        return {
            "success": True,
            "temperature": 32,
            "feels_like": 34,
            "condition": "Hot and dry",
            "icon": "01d",
            "humidity": 30,
            "wind_speed": 12,
            "advice": "☀️ Hot! Stay hydrated and avoid midday sun."
        }
    else:  # Summer/Green season (Dec-Apr)
        return {
            "success": True,
            "temperature": 28,
            "feels_like": 30,
            "condition": "Warm with possible afternoon showers",
            "icon": "02d",
            "humidity": 55,
            "wind_speed": 10,
            "advice": "🌧️ Possible afternoon showers. Morning game drives recommended!"
        }