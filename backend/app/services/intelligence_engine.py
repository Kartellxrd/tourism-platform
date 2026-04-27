import math
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from ..models.destination import Destination
from ..models.wildlife import WildlifeSighting, WildlifeCalendar
from ..models.preference import UserPreference
from ..services.ai_engine import get_recommendations, FEATURES

class IntelligenceEngine:
    """
    Multi-layer AI intelligence for Botswana tourism
    Combines: Wildlife sightings, Seasonal data, Weather, User preferences, Real-time factors
    """
    
    def __init__(self, db: Session, user_id: str = None):
        self.db = db
        self.user_id = user_id
        self.current_month = datetime.now().month
        self.current_hour = datetime.now().hour
        self.current_date = datetime.now()
        
    async def get_wildlife_answer(self, query: str, animal_name: str = None) -> Dict:
        """
        Answer wildlife-related questions with INTELLIGENT context
        """
        # Extract animal from query if not provided
        if not animal_name:
            animal_name = self._extract_animal_from_query(query)
        
        if not animal_name:
            return self._get_general_wildlife_answer(query)
        
        # Get wildlife data from database
        wildlife_data = self.db.query(WildlifeSighting).filter(
            WildlifeSighting.animal_name.ilike(f"%{animal_name}%")
        ).all()
        
        if not wildlife_data:
            return self._get_fallback_animal_response(animal_name)
        
        # Get user preferences for personalization
        user_prefs = self._get_user_preferences()
        
        # Build intelligent response
        response = self._build_intelligent_wildlife_response(
            animal_name, wildlife_data, user_prefs
        )
        
        return response
    
    def _extract_animal_from_query(self, query: str) -> Optional[str]:
        """Extract animal name from natural language query"""
        animals = [
            "lion", "elephant", "rhino", "leopard", "buffalo", "cheetah", 
            "hippo", "crocodile", "zebra", "giraffe", "wild dog", "hyena",
            "ostrich", "wildebeest", "kudu", "impala", "springbok", "baboon"
        ]
        
        query_lower = query.lower()
        for animal in animals:
            if animal in query_lower:
                return animal
        return None
    
    def _get_user_preferences(self) -> Dict:
        """Get user preferences for personalization"""
        if self.user_id:
            prefs = self.db.query(UserPreference).filter(
                UserPreference.user_id == self.user_id
            ).first()
            if prefs:
                return {f: getattr(prefs, f, 0.5) for f in FEATURES}
        return {f: 0.5 for f in FEATURES}
    
    def _build_intelligent_wildlife_response(self, animal: str, wildlife_data: List, user_prefs: Dict) -> Dict:
        """Build context-aware, personalized wildlife response"""
        
        # Find best destinations for this animal
        best_destinations = {}
        for data in wildlife_data:
            dest = self.db.query(Destination).filter(
                Destination.id == data.destination_id
            ).first()
            if dest:
                best_destinations[dest.id] = {
                    "name": dest.name,
                    "probability": data.probability_rating,
                    "best_months": data.best_months,
                    "best_hours": f"{data.best_hours_start}:00-{data.best_hours_end}:00",
                    "tips": data.viewing_tips,
                    "habitat": data.habitat
                }
        
        # Determine if current time is optimal
        current_month_optimal = self.current_month in wildlife_data[0].best_months
        current_hour_optimal = wildlife_data[0].best_hours_start <= self.current_hour <= wildlife_data[0].best_hours_end
        
        # Get monthly calendar context
        calendar = self.db.query(WildlifeCalendar).filter(
            WildlifeCalendar.month == self.current_month
        ).first()
        
        # Build the intelligent response
        response_parts = []
        
        # Header with emoji
        animal_emoji = self._get_animal_emoji(animal)
        response_parts.append(f"{animal_emoji} **{animal.capitalize()} Sightings in Botswana**\n")
        
        # Current timing intelligence
        if current_month_optimal and current_hour_optimal:
            response_parts.append(f"🟢 **RIGHT NOW is an excellent time!** {self.current_hour}:00 is within peak viewing hours ({wildlife_data[0].best_hours_start}:00-{wildlife_data[0].best_hours_end}:00).")
        elif current_month_optimal:
            response_parts.append(f"🟡 **This month ({self._get_month_name()}) is good** but go during peak hours ({wildlife_data[0].best_hours_start}:00-{wildlife_data[0].best_hours_end}:00) for best chances.")
        else:
            best_months_str = ", ".join([self._get_month_name(m) for m in wildlife_data[0].best_months[:3]])
            response_parts.append(f"🟠 Best time is {best_months_str}. Current month has lower sighting probability.")
        
        # Best destinations
        response_parts.append(f"\n📍 **Best places to see {animal}s:**")
        for i, (dest_id, info) in enumerate(list(best_destinations.items())[:3], 1):
            response_parts.append(f"\n{i}. **{info['name']}** - {info['probability']}% sighting probability")
            response_parts.append(f"   ⏰ Best time: {info['best_hours']}")
            response_parts.append(f"   💡 Tip: {info['tips']}")
        
        # Monthly context
        if calendar:
            response_parts.append(f"\n📅 **{self._get_month_name()} Overview:**")
            response_parts.append(f"   • Wildlife rating: {'⭐' * (calendar.wildlife_rating // 2)} ({calendar.wildlife_rating}/10)")
            response_parts.append(f"   • Events: {', '.join(calendar.events[:2])}")
            response_parts.append(f"   • Weather: {calendar.avg_temp_high}°C / {calendar.avg_temp_low}°C")
        
        # Personalized recommendation
        if user_prefs.get('wildlife', 0) > 0.7:
            response_parts.append(f"\n🎯 **Personalized for you:** Based on your {int(user_prefs['wildlife']*100)}% wildlife preference, I highly recommend visiting {list(best_destinations.values())[0]['name']} during peak season.")
        else:
            response_parts.append(f"\n💡 **Pro tip:** {list(best_destinations.values())[0]['tips']}")
        
        # Action buttons
        response_parts.append(f"\n\n✨ Would you like me to:")
        response_parts.append(f"• Book a {animal} safari for you")
        response_parts.append(f"• Show you current availability")
        response_parts.append(f"• Compare prices across destinations")
        
        return {
            "response": "\n".join(response_parts),
            "action": "wildlife_query",
            "animal": animal,
            "best_destination": list(best_destinations.keys())[0] if best_destinations else None,
            "current_optimal": current_month_optimal and current_hour_optimal
        }
    
    def _get_general_wildlife_answer(self, query: str) -> Dict:
        """Answer general wildlife questions"""
        
        # Get current month's calendar
        calendar = self.db.query(WildlifeCalendar).filter(
            WildlifeCalendar.month == self.current_month
        ).first()
        
        # Get top wildlife destinations
        top_destinations = self.db.query(Destination).filter(
            Destination.category == "Wildlife"
        ).limit(3).all()
        
        response = f"🦁 **Wildlife Viewing in Botswana - {self._get_month_name()} {self.current_date.year}**\n\n"
        
        if calendar:
            response += f"📅 **Current Month Overview:**\n"
            response += f"   • Wildlife Rating: {'⭐' * (calendar.wildlife_rating // 2)} ({calendar.wildlife_rating}/10)\n"
            response += f"   • Season: {calendar.season_type}\n"
            response += f"   • Events: {', '.join(calendar.events)}\n\n"
        
        response += f"📍 **Top Wildlife Destinations:**\n"
        for dest in top_destinations:
            response += f"   • **{dest.name}** - {dest.ai_reason}\n"
        
        response += f"\n💡 **Tip:** {self._get_daily_wildlife_tip()}\n\n"
        response += f"🐘 Ask me about specific animals like 'lions', 'elephants', or 'rhinos' for detailed information!"
        
        return {"response": response, "action": None}
    
    def _get_fallback_animal_response(self, animal: str) -> Dict:
        """Fallback when animal not in database"""
        response = f"🦁 **About {animal.capitalize()} in Botswana**\n\n"
        response += f"While I don't have specific data about {animal}s, Botswana is home to incredible wildlife!\n\n"
        response += f"**Recommended parks for wildlife viewing:**\n"
        response += f"• Chobe National Park - Known for elephants and predators\n"
        response += f"• Moremi Game Reserve - Excellent for big cats\n"
        response += f"• Okavango Delta - Unique ecosystem\n\n"
        response += f"💡 Best time for general wildlife: **May to October** (dry season)\n\n"
        response += f"Want me to recommend a safari package instead?"
        
        return {"response": response, "action": None}
    
    def _get_animal_emoji(self, animal: str) -> str:
        emojis = {
            "lion": "🦁", "elephant": "🐘", "rhino": "🦏", "leopard": "🐆",
            "buffalo": "🐃", "cheetah": "🐆", "hippo": "🦛", "crocodile": "🐊",
            "zebra": "🦓", "giraffe": "🦒", "wild dog": "🐕", "ostrich": "🐦"
        }
        return emojis.get(animal, "🦁")
    
    def _get_month_name(self, month: int = None) -> str:
        if month is None:
            month = self.current_month
        months = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"]
        return months[month - 1]
    
    def _get_daily_wildlife_tip(self) -> str:
        """Return a daily wildlife tip based on time and month"""
        tips = [
            "Early morning (6am-9am) is best for predator sightings!",
            "Late afternoon (4pm-6pm) offers golden light for photography",
            "During dry season, animals gather at water sources - best viewing!",
            "Book sunrise game drives for the most active wildlife",
            "Bring binoculars and a camera with good zoom!",
            "Neutral colored clothing helps you blend in",
            "Stay quiet during game drives for better sightings"
        ]
        # Return tip based on current hour
        if self.current_hour < 10:
            return tips[0]
        elif self.current_hour < 15:
            return "Midday is great for bird watching and hippos in water!"
        else:
            return tips[1]