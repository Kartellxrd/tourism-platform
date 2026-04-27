from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import json
import base64

from ..database import get_db
from ..services.discovery_service import AutoDiscoveryService

router = APIRouter(prefix="/discovery", tags=["Auto Discovery"])

class DiscoveryRequest(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    radius_km: int = 25

# Helper to verify Keycloak token
async def verify_admin(authorization: Optional[str] = Header(None)):
    """Verify the Keycloak token and check for admin role"""
    
    if not authorization:
        print("❌ No authorization header")
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Extract token from "Bearer <token>"
    if not authorization.startswith("Bearer "):
        print("❌ Authorization header doesn't start with Bearer")
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # Decode JWT manually without jwt library
        token_parts = token.split('.')
        if len(token_parts) != 3:
            raise HTTPException(status_code=401, detail="Invalid token format")
        
        # Add padding if needed for base64 decoding
        payload = token_parts[1]
        payload += '=' * (4 - len(payload) % 4)
        
        # Decode base64
        decoded = base64.b64decode(payload)
        token_data = json.loads(decoded)
        
        print(f"✅ Token decoded for user: {token_data.get('preferred_username', 'unknown')}")
        print(f"✅ Roles: {token_data.get('realm_access', {}).get('roles', [])}")
        
        # Check for admin role
        roles = token_data.get('realm_access', {}).get('roles', [])
        
        if 'admin' not in roles:
            print(f"❌ User doesn't have admin role. Roles: {roles}")
            raise HTTPException(status_code=403, detail="Admin access required")
        
        return token_data
        
    except json.JSONDecodeError as e:
        print(f"❌ Failed to decode token: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        print(f"❌ Token verification error: {e}")
        raise HTTPException(status_code=401, detail=f"Token error: {str(e)}")


@router.get("/preview")
async def preview_discovery(
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: int = 10,
    user: dict = Depends(verify_admin)
):
    """Preview what would be discovered (Admin only)"""
    
    print(f"🔍 Preview discovery for lat={lat}, lng={lng}, radius={radius_km}km")
    
    try:
        service = AutoDiscoveryService()
        
        if lat is None or lng is None:
            lat = getattr(service, 'DEFAULT_LAT', -24.6282)
            lng = getattr(service, 'DEFAULT_LNG', 25.9231)
        
        print(f"📍 Using coordinates: ({lat}, {lng})")
        
        results = await service.discover_nearby(lat, lng, radius_km)
        
        print(f"✅ Found {len(results)} attractions")
        
        return {
            "success": True,
            "count": len(results),
            "attractions": results[:20],
            "location": {"lat": lat, "lng": lng},
            "radius_km": radius_km
        }
    except Exception as e:
        print(f"❌ Discovery preview error: {e}")
        raise HTTPException(status_code=500, detail=f"Discovery error: {str(e)}")


@router.post("/run")
async def run_discovery(
    request: DiscoveryRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    """Manually trigger auto-discovery (Admin only)"""
    
    print(f"🚀 Running discovery for lat={request.lat}, lng={request.lng}, radius={request.radius_km}km")
    
    try:
        service = AutoDiscoveryService()
        
        lat = request.lat if request.lat is not None else getattr(service, 'DEFAULT_LAT', -24.6282)
        lng = request.lng if request.lng is not None else getattr(service, 'DEFAULT_LNG', 25.9231)
        
        # Run in background to avoid timeout
        background_tasks.add_task(
            service.sync_to_database,
            lat,
            lng,
            request.radius_km
        )
        
        return {
            "success": True,
            "message": "Auto-discovery started! New destinations will be added shortly.",
            "radius_km": request.radius_km
        }
    except Exception as e:
        print(f"❌ Discovery run error: {e}")
        raise HTTPException(status_code=500, detail=f"Discovery error: {str(e)}")