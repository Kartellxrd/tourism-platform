"""Completely reset destinations table"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.models.destination import Destination

def reset_destinations():
    db = SessionLocal()
    
    try:
        print("🗑️  Dropping all destinations...")
        
        # Count before
        count_before = db.query(Destination).count()
        print(f"   Destinations before: {count_before}")
        
        # Delete ALL destinations
        deleted = db.query(Destination).delete()
        db.commit()
        
        print(f"   Deleted: {deleted} destinations")
        print(f"   Destinations after: {db.query(Destination).count()}")
        
        # Reset auto-increment (PostgreSQL)
        try:
            db.execute("ALTER SEQUENCE destinations_id_seq RESTART WITH 1")
            db.commit()
            print("   ✅ Reset ID sequence to 1")
        except:
            print("   ℹ️  Could not reset sequence (might be MySQL)")
        
        print("\n✅ Database cleared successfully!")
        print("🚀 Now run Auto-Discovery again for fresh data")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    confirm = input("⚠️  This will DELETE ALL destinations. Continue? (yes/no): ")
    if confirm.lower() == 'yes':
        reset_destinations()
    else:
        print("Cancelled.")