from .destinations import router as destinations_router
from .nearby import router as nearby_router
from .wishlist import router as wishlist_router
from .preferences import router as preferences_router
from .recommendations import router as recommendations_router
from .interactions import router as interactions_router
from .bookings import router as bookings_router
from .ai_query import router as ai_router
from .explore import router as explore_router
from .payments import router as payments_router
from .ai_chat import router as ai_chat_router
from .notifications import router as notifications_router
from .wildlife import router as wildlife_router
from .analytics import router as analytics_router
from .weather import router as weather_router
from .itinerary import router as itinerary_router
from .admin import router as admin_router
from .discovered import router as discovered_router

__all__ = [
    "destinations_router",
    "nearby_router", 
    "wishlist_router",
    "preferences_router",
    "recommendations_router",
    "interactions_router",
    "bookings_router",
    "ai_router",
    "explore_router",
    "payments_router",
    "ai_chat_router",
    "notifications_router",
    "wildlife_router",
    "analytics_router",
    "weather_router",
    "itinerary_router",
    "admin_router",
    "discovered_router",
]