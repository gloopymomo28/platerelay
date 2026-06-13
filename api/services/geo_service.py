"""
PlateRelay — Geo Service
Geospatial helpers for finding nearby recipients.
"""

from database import get_db


async def find_nearby_recipients(
    longitude: float,
    latitude: float,
    radius_km: float = 10.0,
    limit: int = 100,
) -> list[dict]:
    """
    Find verified recipients within `radius_km` of the given coordinates.
    Uses MongoDB 2dsphere index on users.location.
    """
    db = get_db()
    pipeline = [
        {
            "$geoNear": {
                "near": {"type": "Point", "coordinates": [longitude, latitude]},
                "distanceField": "distance_meters",
                "maxDistance": radius_km * 1000,
                "spherical": True,
                "query": {
                    "role": "recipient",
                    "verification_status": "verified",
                },
            }
        },
        {"$sort": {"distance_meters": 1}},
        {"$limit": limit},
    ]
    return await db.users.aggregate(pipeline).to_list(limit)


async def get_distance_between(
    coord1: list[float], coord2: list[float]
) -> float | None:
    """
    Quick haversine-like distance using MongoDB $geoNear on a temp query.
    For simple use, we compute it in Python instead.
    Returns distance in kilometers.
    """
    import math

    lon1, lat1 = math.radians(coord1[0]), math.radians(coord1[1])
    lon2, lat2 = math.radians(coord2[0]), math.radians(coord2[1])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371  # Earth's radius in km

    return round(r * c, 2)
