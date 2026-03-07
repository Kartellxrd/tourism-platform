# backend/app/services/wishlist.py
#
# Pure business logic — no FastAPI or HTTP concerns here.
# Routes call these functions and handle the HTTP layer.

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from models.wishlist import Wishlist


def get_user_wishlist(db: Session, user_id: str) -> list[Wishlist]:
    """Return all wishlist items for a user, newest first."""
    return (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user_id)
        .order_by(Wishlist.saved_at.desc())
        .all()
    )


def add_wishlist_item(db: Session, user_id: str, data: dict) -> Wishlist | None:
    """
    Save a destination to wishlist.
    Returns the new row, or None if it already exists (duplicate).
    """
    item = Wishlist(
        user_id        = user_id,
        destination_id = data["destination_id"],
        name           = data["name"],
        location       = data["location"],
        region         = data.get("region"),
        price          = data["price"],
        price_label    = data.get("price_label"),
        rating         = data.get("rating"),
        reviews        = data.get("reviews", 0),
        category       = data.get("category"),
        tag            = data.get("tag"),
        tag_color      = data.get("tag_color"),
        photo          = data.get("photo"),
        gradient       = data.get("gradient"),
        description    = data.get("description"),
        features       = data.get("features", []),
        ai_reason      = data.get("ai_reason"),
        match_score    = data.get("match_score", 0),
    )
    db.add(item)
    try:
        db.commit()
        db.refresh(item)
        return item
    except IntegrityError:
        db.rollback()
        return None   # already exists — caller handles the 409


def remove_wishlist_item(db: Session, user_id: str, destination_id: int) -> bool:
    """
    Delete one wishlist item.
    Returns True if deleted, False if not found.
    """
    item = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id        == user_id,
            Wishlist.destination_id == destination_id,
        )
        .first()
    )
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


def is_wishlisted(db: Session, user_id: str, destination_id: int) -> bool:
    """Check if a destination is already in the user's wishlist."""
    return (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id        == user_id,
            Wishlist.destination_id == destination_id,
        )
        .first()
    ) is not None


def clear_user_wishlist(db: Session, user_id: str) -> int:
    """Delete all wishlist items for a user. Returns count of deleted rows."""
    deleted = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user_id)
        .delete()
    )
    db.commit()
    return deleted