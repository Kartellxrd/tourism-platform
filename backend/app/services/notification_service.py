from sqlalchemy.orm import Session
from datetime import datetime
from ..models.notification import Notification

class NotificationService:
    
    @staticmethod
    def create_booking_notification(db: Session, user_id: str, booking_reference: str, destination_name: str):
        notification = Notification(
            user_id=user_id,
            type="booking",
            title="New Booking Created",
            message=f"Your booking for {destination_name} (Ref: {booking_reference}) has been created.",
            extra_data={"booking_reference": booking_reference, "destination": destination_name},
            is_read=False
        )
        db.add(notification)
        db.commit()
        return notification
    
    @staticmethod
    def create_confirmation_notification(db: Session, user_id: str, booking_reference: str, destination_name: str):
        notification = Notification(
            user_id=user_id,
            type="confirmation",
            title="Booking Confirmed",
            message=f"Great news! Your booking for {destination_name} (Ref: {booking_reference}) is confirmed!",
            extra_data={"booking_reference": booking_reference, "destination": destination_name},
            is_read=False
        )
        db.add(notification)
        db.commit()
        return notification
    
    @staticmethod
    def create_payment_notification(db: Session, user_id: str, amount: float, destination_name: str):
        notification = Notification(
            user_id=user_id,
            type="payment",
            title="Payment Received",
            message=f"Payment of P{amount} for {destination_name} has been received. Thank you!",
            extra_data={"amount": amount, "destination": destination_name},
            is_read=False
        )
        db.add(notification)
        db.commit()
        return notification
    
    @staticmethod
    def create_cancellation_notification(db: Session, user_id: str, booking_reference: str, refund_amount: float):
        notification = Notification(
            user_id=user_id,
            type="cancellation",
            title="Booking Cancelled",
            message=f"Your booking (Ref: {booking_reference}) has been cancelled.",
            extra_data={"booking_reference": booking_reference, "refund_amount": refund_amount},
            is_read=False
        )
        db.add(notification)
        db.commit()
        return notification
    
    @staticmethod
    def get_user_notifications(db: Session, user_id: str, limit: int = 20, unread_only: bool = False):
        query = db.query(Notification).filter(Notification.user_id == user_id)
        if unread_only:
            query = query.filter(Notification.is_read == False)
        return query.order_by(Notification.created_at.desc()).limit(limit).all()
    
    @staticmethod
    def mark_as_read(db: Session, notification_id: int, user_id: str):
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        if notification:
            notification.is_read = True
            db.commit()
            return True
        return False
    
    @staticmethod
    def mark_all_as_read(db: Session, user_id: str):
        result = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True})
        db.commit()
        return result
    
    @staticmethod
    def get_unread_count(db: Session, user_id: str):
        return db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()