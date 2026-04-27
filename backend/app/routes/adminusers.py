from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import httpx
import os
from ..database import get_db
from ..routes.wishlist import get_current_user
from ..models.booking import Booking

router = APIRouter(prefix="/admin/users", tags=["Admin Users"])

KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://localhost:8080")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "PulaPath")
KEYCLOAK_ADMIN_USER = os.getenv("KEYCLOAK_ADMIN_USER", "admin")
KEYCLOAK_ADMIN_PASSWORD = os.getenv("KEYCLOAK_ADMIN_PASSWORD", "admin")

async def get_keycloak_admin_token():
    """Get admin token from Keycloak to access user API"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{KEYCLOAK_URL}/realms/master/protocol/openid-connect/token",
            data={
                "grant_type": "password",
                "client_id": "admin-cli",
                "username": KEYCLOAK_ADMIN_USER,
                "password": KEYCLOAK_ADMIN_PASSWORD
            }
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to get Keycloak admin token")
        return response.json()["access_token"]

@router.get("")
async def get_all_users(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get all users from Keycloak with their booking stats"""
    
    # Get admin token
    admin_token = await get_keycloak_admin_token()
    
    # Fetch users from Keycloak
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{KEYCLOAK_URL}/admin/realms/{KEYCLOAK_REALM}/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch users from Keycloak")
        
        keycloak_users = response.json()
    
    # Enrich with booking data from your database
    result = []
    for kc_user in keycloak_users:
        user_id = kc_user["id"]
        
        # Get user bookings from your MySQL
        bookings = db.query(Booking).filter(Booking.user_id == user_id).all()
        booking_count = len(bookings)
        total_spent = sum(b.total_price or 0 for b in bookings)
        
        result.append({
            "user_id": user_id,
            "email": kc_user.get("email", "N/A"),
            "first_name": kc_user.get("firstName", ""),
            "last_name": kc_user.get("lastName", ""),
            "username": kc_user.get("username", ""),
            "enabled": kc_user.get("enabled", True),
            "created_at": kc_user.get("createdTimestamp"),
            "booking_count": booking_count,
            "total_spent": float(total_spent)
        })
    
    return {"success": True, "users": result}

@router.get("/{user_id}")
async def get_user_detail(
    user_id: str,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get detailed user information from Keycloak + bookings"""
    
    # Get admin token
    admin_token = await get_keycloak_admin_token()
    
    # Fetch user from Keycloak
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{KEYCLOAK_URL}/admin/realms/{KEYCLOAK_REALM}/users/{user_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="User not found")
        
        kc_user = response.json()
    
    # Get user bookings
    bookings = db.query(Booking).filter(Booking.user_id == user_id).all()
    
    return {
        "success": True,
        "user": {
            "user_id": user_id,
            "email": kc_user.get("email"),
            "first_name": kc_user.get("firstName"),
            "last_name": kc_user.get("lastName"),
            "username": kc_user.get("username"),
            "enabled": kc_user.get("enabled"),
            "created_at": kc_user.get("createdTimestamp"),
            "bookings": [
                {
                    "booking_reference": b.booking_reference,
                    "destination_name": b.destination_name,
                    "check_in": b.check_in.strftime("%Y-%m-%d"),
                    "check_out": b.check_out.strftime("%Y-%m-%d"),
                    "total_price": float(b.total_price),
                    "status": b.booking_status
                } for b in bookings
            ],
            "total_spent": sum(float(b.total_price) for b in bookings),
            "booking_count": len(bookings)
        }
    }