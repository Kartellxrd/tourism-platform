import googlemaps
import os
from typing import List, Dict, Optional

class AutoDiscoveryService:
    """Service to auto-discover tourist attractions using Google Places API"""

    DEFAULT_LAT = -24.6282
    DEFAULT_LNG = 25.9231

    def __init__(self):
        api_key = os.getenv("GOOGLE_MAPS_API_KEY") or os.getenv("NEXT_PUBLIC_GOOGLE_MAPS_KEY")
        if not api_key:
            raise ValueError("Google Maps API key not set")
        self.gmaps = googlemaps.Client(key=api_key)

    async def discover_nearby(
        self,
        lat: float,
        lng: float,
        radius_km: int = 25
    ) -> List[Dict]:
        """Discover tourist attractions near given coordinates using Google Places"""

        radius_m = radius_km * 1000
        print(f"🔍 Google Places: Searching tourist attractions near ({lat}, {lng}) radius {radius_km}km")

        try:
            results = self.gmaps.places_nearby(
                location=(lat, lng),
                radius=radius_m,
                type='tourist_attraction',
                language='en'
            )

            attractions = []
            seen_ids = set()

            for place in results.get('results', []):
                place_id = place.get('place_id')
                if place_id in seen_ids:
                    continue
                seen_ids.add(place_id)

                types = place.get('types', [])
                category = self._map_category(types)

                # Photo URL
                photo_url = None
                if place.get('photos'):
                    photo_reference = place['photos'][0]['photo_reference']
                    photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference={photo_reference}&key={self.gmaps.key}"

                # Rich description
                desc_parts = []
                if place.get('vicinity'):
                    desc_parts.append(f"Located at {place['vicinity']}.")
                if place.get('rating'):
                    desc_parts.append(f"Google rating: {place['rating']}/5.")
                if not desc_parts:
                    desc_parts.append(f"Visit {place['name']} in Botswana.")

                features = [t.replace('_', ' ').title() for t in types if t not in ['point_of_interest', 'establishment']][:6] or ['Sightseeing', 'Photography']

                attractions.append({
                    'osm_id': place_id,
                    'name': place['name'],
                    'lat': place['geometry']['location']['lat'],
                    'lng': place['geometry']['location']['lng'],
                    'type': 'tourist_attraction',
                    'category': category,
                    'tags': {},
                    'location': place.get('vicinity', 'Botswana'),
                    'description': ' '.join(desc_parts),
                    'features': features,
                    'photo_url': photo_url,
                    'rating': place.get('rating', 4.5),
                    'reviews': place.get('user_ratings_total', 0),
                })

            print(f"✅ Google Places returned {len(attractions)} attractions")
            return attractions

        except Exception as e:
            print(f"❌ Google Places API error: {e}")
            return []

    def _map_category(self, types: List[str]) -> str:
        type_str = ' '.join(types).lower()
        if 'zoo' in types or 'wildlife' in type_str:
            return 'Wildlife'
        if 'museum' in types or 'art_gallery' in types:
            return 'Culture'
        if 'historic_site' in types or 'monument' in types or 'castle' in types:
            return 'Historical'
        if 'amusement_park' in types or 'theme_park' in types or 'viewpoint' in types:
            return 'Adventure'
        if 'shopping_mall' in types:
            return 'Shopping'
        return 'Attraction'

    def _determine_region(self, lat: float, lng: float) -> str:
        if lat > -22.0 and lng > 26.0:
            return 'North-East'
        elif lat > -22.0:
            return 'North-West'
        elif lat > -24.0 and lng > 26.0:
            return 'Central'
        else:
            return 'South-East'

    async def sync_to_database(self, lat: float, lng: float, radius_km: int = 25):
        from ..database import SessionLocal
        from ..models.destination import Destination

        print(f"🔄 Starting Google Places database sync...")
        attractions = await self.discover_nearby(lat, lng, radius_km)

        if not attractions:
            print("ℹ️ No tourist attractions discovered")
            return

        db = SessionLocal()
        added = 0
        skipped = 0

        try:
            for attr in attractions:
                existing = db.query(Destination).filter(
                    Destination.name == attr['name'],
                    Destination.lat == attr['lat'],
                    Destination.lng == attr['lng']
                ).first()

                if existing:
                    skipped += 1
                    continue

                tag_colors = {'Wildlife':'#059669','Culture':'#7C3AED','Historical':'#D97706','Adventure':'#2563EB','Attraction':'#0891B2'}
                gradients = {'Wildlife':'from-green-500 to-emerald-600','Culture':'from-purple-500 to-indigo-600','Historical':'from-amber-500 to-orange-600','Adventure':'from-blue-500 to-cyan-600','Attraction':'from-cyan-500 to-teal-600'}
                ai_reasons = {'Wildlife': f"🦁 Perfect for wildlife enthusiasts – {attr['name']}",'Culture': f"🎭 Immerse yourself in culture at {attr['name']}",'Historical': f"🏛️ Explore the history of {attr['name']}",'Adventure': f"⚡ Adventure awaits at {attr['name']}",'Attraction': f"⭐ {attr['name']} is a must-see destination"}

                destination = Destination(
                    name=attr['name'],
                    location=attr['location'],
                    region=self._determine_region(attr['lat'], attr['lng']),
                    lat=attr['lat'],
                    lng=attr['lng'],
                    price=0,
                    price_label='FREE',
                    rating=attr.get('rating', 4.5),
                    reviews=attr.get('reviews', 0),
                    category=attr['category'],
                    tag='Tourist Attraction',
                    tag_color=tag_colors.get(attr['category'], '#0891B2'),
                    photo_url=attr.get('photo_url'),
                    gradient=gradients.get(attr['category'], 'from-cyan-500 to-teal-600'),
                    description=attr['description'],
                    features=attr['features'],
                    ai_reason=ai_reasons.get(attr['category'], f"⭐ Visit {attr['name']}"),
                    match_score=80,
                    place_id=f"gp_{attr['osm_id']}"
                )
                db.add(destination)
                added += 1

                if added % 10 == 0:
                    db.commit()
                    print(f"  ✅ Committed {added} so far")

            db.commit()
            print(f"✅ SUCCESS: Added {added} new attractions, skipped {skipped}")
        except Exception as e:
            db.rollback()
            print(f"❌ DB error: {e}")
            import traceback
            traceback.print_exc()
        finally:
            db.close()