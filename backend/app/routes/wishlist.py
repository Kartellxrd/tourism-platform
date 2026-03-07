# backend/app/routes/wishlist.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os, httpx
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from database import get_db
from services.wishlist import (
    get_user_wishlist,
    add_wishlist_item,
    remove_wishlist_item,
    is_wishlisted,
    clear_user_wishlist,
)

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

# ── Keycloak JWT verification ─────────────────────────────────────────────────
KEYCLOAK_URL   = os.getenv("KEYCLOAK_URL",   "http://localhost:8080")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "PulaPath")

bearer_scheme = HTTPBearer()
_jwks_cache   = None


async def _get_jwks() -> dict:
    """Fetch Keycloak public keys (cached after first call)."""
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache
    url = f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/certs"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=10)
        resp.raise_for_status()
        _jwks_cache = resp.json()
    return _jwks_cache


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Validates the Bearer JWT from Keycloak.
    Returns the decoded token payload (sub = Keycloak user UUID).
    """
    token = credentials.credentials
    try:
        jwks    = await _get_jwks()
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        if not payload.get("sub"):
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── Pydantic schemas (kept here for simplicity, easy to split later) ──────────
class WishlistItemCreate(BaseModel):
    destination_id: int
    name:           str
    location:       str
    region:         Optional[str]  = None
    price:          int
    price_label:    Optional[str]  = None
    rating:         Optional[float]= None
    reviews:        Optional[int]  = 0
    category:       Optional[str]  = None
    tag:            Optional[str]  = None
    tag_color:      Optional[str]  = None
    photo:          Optional[str]  = None
    gradient:       Optional[str]  = None
    description:    Optional[str]  = None
    features:       Optional[List[str]] = []
    ai_reason:      Optional[str]  = None
    match_score:    Optional[int]  = 0


class WishlistItemOut(BaseModel):
    id:             int
    destination_id: int
    name:           str
    location:       str
    region:         Optional[str]
    price:          int
    price_label:    Optional[str]
    rating:         Optional[float]
    reviews:        Optional[int]
    category:       Optional[str]
    tag:            Optional[str]
    tag_color:      Optional[str]
    photo:          Optional[str]
    gradient:       Optional[str]
    description:    Optional[str]
    features:       Optional[List[str]]
    ai_reason:      Optional[str]
    match_score:    Optional[int]
    saved_at:       datetime

    class Config:
        from_attributes = True


# ── Endpoints ─────────────────────────────────────────────────────────────────

# GET /wishlist — fetch entire wishlist for logged-in user
@router.get("", response_model=dict)
async def get_wishlist(
    db:   Session = Depends(get_db),
    user: dict    = Depends(get_current_user),
):
    items = get_user_wishlist(db, user["sub"])
    return {
        "items": [WishlistItemOut.model_validate(i).model_dump() for i in items],
        "total": len(items),
    }


# POST /wishlist — add a destination
@router.post("", response_model=WishlistItemOut, status_code=201)
async def add_to_wishlist(
    payload: WishlistItemCreate,
    db:      Session = Depends(get_db),
    user:    dict    = Depends(get_current_user),
):
    item = add_wishlist_item(db, user["sub"], payload.model_dump())
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Destination already in wishlist",
        )
    return item


# DELETE /wishlist/clear — must be BEFORE /{destination_id} so FastAPI doesn't confuse "clear" as an int
@router.delete("/clear", status_code=204)
async def clear_wishlist(
    db:   Session = Depends(get_db),
    user: dict    = Depends(get_current_user),
):
    clear_user_wishlist(db, user["sub"])


# GET /wishlist/check/{destination_id} — is this destination saved?
@router.get("/check/{destination_id}")
async def check_wishlist(
    destination_id: int,
    db:   Session = Depends(get_db),
    user: dict    = Depends(get_current_user),
):
    saved = is_wishlisted(db, user["sub"], destination_id)
    return {"wishlisted": saved, "destination_id": destination_id}


# DELETE /wishlist/{destination_id} — remove one item
@router.delete("/{destination_id}", status_code=204)
async def remove_from_wishlist(
    destination_id: int,
    db:   Session = Depends(get_db),
    user: dict    = Depends(get_current_user),
):
    deleted = remove_wishlist_item(db, user["sub"], destination_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")