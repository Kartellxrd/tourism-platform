from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .wishlist import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/")
async def get_notifications(
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get user notifications - returns empty for now"""
    # TODO: Implement proper notifications
    return {"notifications": [], "unread_count": 0}

@router.get("/unread-count")
async def get_unread_count(
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get unread count - returns 0 for now"""
    return {"unread_count": 0}

@router.post("/mark-read")
async def mark_as_read(
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Mark notification as read"""
    return {"success": True}

@router.post("/mark-all-read")
async def mark_all_as_read(
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Mark all as read"""
    return {"success": True}