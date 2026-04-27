import asyncio
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.discovery_service import AutoDiscoveryService

async def run_daily_discovery():
    """Run auto-discovery daily at 2 AM"""
    print("🔄 Running daily auto-discovery...")
    service = AutoDiscoveryService()
    count = await service.sync_to_database(radius_km=50)
    print(f"✅ Daily discovery complete. Added {count} new destinations.")

if __name__ == "__main__":
    asyncio.run(run_daily_discovery())