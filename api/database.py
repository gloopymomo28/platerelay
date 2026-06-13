"""
PlateRelay — Database Connection
Module-level cached Motor async client.
Reused across warm Vercel function invocations.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import get_settings

_client: AsyncIOMotorClient | None = None


def get_db() -> AsyncIOMotorDatabase:
    """
    Return the 'platerelay' database handle.
    Creates the Motor client once (module-level singleton)
    with conservative pool settings for Atlas M0 free tier.
    """
    global _client
    if _client is None:
        settings = get_settings()
        _client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            maxPoolSize=10,
            minPoolSize=1,
            maxIdleTimeMS=30000,      # close idle connections after 30s
            connectTimeoutMS=5000,
            serverSelectionTimeoutMS=5000,
        )
    return _client["platerelay"]
