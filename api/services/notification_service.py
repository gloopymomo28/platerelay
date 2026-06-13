"""
PlateRelay — Notification Service
Creates in-app notifications (stored in MongoDB) and dispatches
email notifications to nearby recipients for new relays.
"""

from datetime import datetime
from bson import ObjectId

from database import get_db
from services.email_service import send_new_relay_email


async def create_notification(
    user_id: ObjectId,
    notification_type: str,
    title: str,
    body: str,
    relay_id: ObjectId | None = None,
) -> dict:
    """Insert a notification document and return it."""
    db = get_db()
    doc = {
        "user_id": user_id,
        "type": notification_type,
        "title": title,
        "body": body,
        "relay_id": relay_id,
        "is_read": False,
        "created_at": datetime.utcnow(),
    }
    result = await db.notifications.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def notify_nearby_recipients(relay: dict, radius_km: float = 10.0):
    """
    Called as a BackgroundTask after a relay is posted.
    1. Find all recipients (geo-filtered in production, all recipients in dev).
    2. Create in-app notification for each.
    3. Send email to each.
    """
    db = get_db()
    pickup_coords = relay.get("pickup_location", {}).get("coordinates", [0, 0])

    food_name = relay.get("food_name", "Delicious food")
    relay_id = relay.get("_id")

    recipients = []

    # Try geo-based lookup first (requires 2dsphere index on users.location)
    try:
        pipeline = [
            {
                "$geoNear": {
                    "near": {"type": "Point", "coordinates": pickup_coords},
                    "distanceField": "distance_meters",
                    "maxDistance": radius_km * 1000,
                    "spherical": True,
                    "query": {
                        "role": "recipient",
                    },
                }
            },
            {"$limit": 100},
        ]
        recipients = await db.users.aggregate(pipeline).to_list(100)
    except Exception as geo_err:
        # $geoNear fails if no 2dsphere index exists or no users have location set.
        # Fall back to notifying ALL recipients.
        pass

    # Fallback: if geo query returned nothing, notify all recipients
    if not recipients:
        recipients = await db.users.find({"role": "recipient"}).limit(100).to_list(100)
        # Add a fake distance field so the loop below doesn't crash
        for r in recipients:
            r["distance_meters"] = 0

    for recipient in recipients:
        # ── In-app notification ──
        distance_km = recipient.get("distance_meters", 0) / 1000
        await create_notification(
            user_id=recipient["_id"],
            notification_type="new_relay_nearby",
            title=f"New relay: {food_name}",
            body=f"{food_name} is available nearby!",
            relay_id=relay_id,
        )

        # ── Email notification ──
        try:
            send_new_relay_email(recipient["email"], relay, distance_km)
        except Exception:
            # Don't fail the whole batch if one email fails
            pass
