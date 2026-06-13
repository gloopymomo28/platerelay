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
    1. Find all verified recipients within radius via $geoNear.
    2. Create in-app notification for each.
    3. Send email to each.
    """
    db = get_db()
    pickup_coords = relay.get("pickup_location", {}).get("coordinates", [0, 0])

    # Find nearby verified recipients
    pipeline = [
        {
            "$geoNear": {
                "near": {"type": "Point", "coordinates": pickup_coords},
                "distanceField": "distance_meters",
                "maxDistance": radius_km * 1000,
                "spherical": True,
                "query": {
                    "role": "recipient",
                    "verification_status": "verified",
                },
            }
        },
        {"$limit": 100},
    ]

    recipients = await db.users.aggregate(pipeline).to_list(100)

    food_name = relay.get("food_name", "Delicious food")
    relay_id = relay.get("_id")

    for recipient in recipients:
        # ── In-app notification ──
        await create_notification(
            user_id=recipient["_id"],
            notification_type="new_relay_nearby",
            title=f"🍽️ New relay: {food_name}",
            body=f"{food_name} is available {recipient['distance_meters'] / 1000:.1f} km away!",
            relay_id=relay_id,
        )

        # ── Email notification ──
        try:
            distance_km_actual = recipient["distance_meters"] / 1000
            send_new_relay_email(recipient["email"], relay, distance_km_actual)
        except Exception:
            # Don't fail the whole batch if one email fails
            pass
