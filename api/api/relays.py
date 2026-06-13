"""
PlateRelay — Relays API Routes
CRUD for food relays, nearby listing with $geoNear + lazy expiry,
claim/unclaim with lazy counter reset, and completion confirmation.
"""

from datetime import datetime, timedelta
from fastapi import (
    APIRouter, BackgroundTasks, Depends, HTTPException,
    Query, UploadFile, File, Form, status,
)
from bson import ObjectId

from auth.dependencies import require_donor, require_recipient, require_verified, get_current_user
from database import get_db
from config import get_settings
from models.common import FoodCategory, QuantityUnit, VegStatus, RelayStatus
from models.relay import RelayCreate, RelayUpdate
from services.cloudinary_service import upload_relay_photo, delete_photo
from services.notification_service import notify_nearby_recipients, create_notification
from services.email_service import send_relay_claimed_email, send_relay_unclaimed_email
from services.badge_service import check_and_award_badges

router = APIRouter(tags=["Relays"])


def _serialize_relay(relay: dict) -> dict:
    """Convert MongoDB relay doc to JSON-safe dict."""
    relay["id"] = str(relay.pop("_id"))
    if isinstance(relay.get("donor_id"), ObjectId):
        relay["donor_id"] = str(relay["donor_id"])
    if isinstance(relay.get("claimed_by"), ObjectId):
        relay["claimed_by"] = str(relay["claimed_by"])
    return relay


# ─────────────────────────────────────────────────────────────
# POST /api/relays — Create a new relay
# ─────────────────────────────────────────────────────────────
@router.post("", status_code=status.HTTP_201_CREATED)
async def create_relay(
    background_tasks: BackgroundTasks,
    food_name: str = Form(...),
    category: FoodCategory = Form(...),
    quantity_value: float = Form(..., gt=0),
    quantity_unit: QuantityUnit = Form(...),
    is_vegetarian: VegStatus = Form(...),
    allergens: str = Form(""),  # comma-separated
    notes: str = Form(""),
    pickup_street: str = Form(...),
    pickup_city: str = Form(...),
    pickup_instructions: str = Form(""),
    pickup_lng: float = Form(...),
    pickup_lat: float = Form(...),
    pickup_window_start: datetime = Form(...),
    pickup_window_end: datetime = Form(...),
    quality_pledge_confirmed: bool = Form(...),
    photo: UploadFile = File(...),
    donor: dict = Depends(require_donor),
):
    """
    Post a new food relay. Requires photo upload and quality pledge.
    Notifies nearby recipients via email (BackgroundTask).
    """
    # ── Validate quality pledge ──
    if not quality_pledge_confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quality pledge must be confirmed. Food safety is non-negotiable! 🌡️",
        )

    # ── Validate pickup window ──
    # Strip timezone info to avoid aware/naive comparison errors
    if pickup_window_start.tzinfo is not None:
        pickup_window_start = pickup_window_start.replace(tzinfo=None)
    if pickup_window_end.tzinfo is not None:
        pickup_window_end = pickup_window_end.replace(tzinfo=None)

    now = datetime.utcnow()
    # NOTE: Strict time validation temporarily relaxed for development/testing.
    # In production, re-enable the checks below.
    # if pickup_window_start < now:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Pickup window must be in the future.",
    #     )
    if pickup_window_end <= pickup_window_start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pickup end time must be after start time.",
        )

    # ── Upload photo ──
    photo_result = await upload_relay_photo(photo)

    # ── Parse allergens ──
    allergen_list = [a.strip() for a in allergens.split(",") if a.strip()] if allergens else []

    # ── Build relay document ──
    relay_doc = {
        "donor_id": donor["_id"],
        "food_name": food_name,
        "category": category.value,
        "quantity": {"value": quantity_value, "unit": quantity_unit.value},
        "is_vegetarian": is_vegetarian.value,
        "allergens": allergen_list,
        "notes": notes or None,
        "photo": photo_result,
        "pickup_address": {
            "street": pickup_street,
            "city": pickup_city,
            "instructions": pickup_instructions or None,
        },
        "pickup_location": {
            "type": "Point",
            "coordinates": [pickup_lng, pickup_lat],
        },
        "pickup_window": {
            "start": pickup_window_start,
            "end": pickup_window_end,
        },
        "status": RelayStatus.ACTIVE.value,
        "claimed_by": None,
        "claimed_at": None,
        "donor_confirmed_completion": False,
        "recipient_confirmed_completion": False,
        "quality_pledge_confirmed": True,
        "created_at": now,
        "updated_at": now,
    }

    db = get_db()
    result = await db.relays.insert_one(relay_doc)
    relay_doc["_id"] = result.inserted_id

    # ── Notify nearby recipients (background) ──
    settings = get_settings()
    background_tasks.add_task(
        notify_nearby_recipients,
        relay_doc,
        settings.DEFAULT_RELAY_RADIUS_KM,
    )

    return {
        "message": "Your relay is live! Someone's night just got better. 🍽️",
        "relay": _serialize_relay(relay_doc),
    }


# ─────────────────────────────────────────────────────────────
# GET /api/relays/mine — My posted relays (donor)
# ─────────────────────────────────────────────────────────────
@router.get("/mine")
async def get_my_relays(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
):
    """List relays posted by the current donor (paginated)."""
    db = get_db()
    skip = (page - 1) * limit

    query = {"donor_id": user["_id"]}
    total = await db.relays.count_documents(query)

    relays = await db.relays.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)

    return {
        "relays": [_serialize_relay(r) for r in relays],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


# ─────────────────────────────────────────────────────────────
# GET /api/relays/nearby — Active relays near a location
# ─────────────────────────────────────────────────────────────
@router.get("/nearby")
async def get_nearby_relays(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius_km: float = Query(10, ge=1, le=50),
    user: dict = Depends(get_current_user),
):
    """
    List active, non-expired relays within radius.
    Uses $geoNear with lazy expiry filter (pickup_window.end > now).
    """
    db = get_db()
    now = datetime.utcnow()
    settings = get_settings()

    # Cap radius by subscription plan
    max_radius = settings.DEFAULT_RELAY_RADIUS_KM
    sub_plan = user.get("subscription", {}).get("plan", "free")
    if sub_plan in ("saathi", "daan_pro"):
        max_radius = settings.MAX_RELAY_RADIUS_KM
    radius_km = min(radius_km, max_radius)

    pipeline = [
        {
            "$geoNear": {
                "near": {"type": "Point", "coordinates": [lng, lat]},
                "distanceField": "distance_meters",
                "maxDistance": radius_km * 1000,
                "spherical": True,
                "query": {
                    "status": "active",
                    "pickup_window.end": {"$gt": now},  # ← lazy expiry
                },
            }
        },
        {"$sort": {"pickup_window.end": 1}},  # soonest expiry first
        {"$limit": 50},
    ]

    relays = await db.relays.aggregate(pipeline).to_list(50)

    # Enrich with donor org name for display
    for relay in relays:
        donor = await db.users.find_one(
            {"_id": relay["donor_id"]},
            {"org_name": 1, "address.city": 1},
        )
        if donor:
            relay["donor_info"] = {
                "org_name": donor.get("org_name", "Anonymous Donor"),
                "city": donor.get("address", {}).get("city", ""),
            }

    return {
        "relays": [_serialize_relay(r) for r in relays],
        "radius_km": radius_km,
        "count": len(relays),
    }


# ─────────────────────────────────────────────────────────────
# GET /api/relays/claimed — My claimed relays (recipient)
# ─────────────────────────────────────────────────────────────
@router.get("/claimed")
async def get_claimed_relays(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(require_recipient),
):
    """List relays claimed by the current recipient."""
    db = get_db()
    skip = (page - 1) * limit

    query = {"claimed_by": user["_id"]}
    total = await db.relays.count_documents(query)

    relays = await db.relays.find(query).sort("claimed_at", -1).skip(skip).limit(limit).to_list(limit)

    return {
        "relays": [_serialize_relay(r) for r in relays],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


# ─────────────────────────────────────────────────────────────
# GET /api/relays/:id — Single relay detail
# ─────────────────────────────────────────────────────────────
@router.get("/{relay_id}")
async def get_relay(relay_id: str, user: dict = Depends(get_current_user)):
    """Get a single relay by ID."""
    db = get_db()
    try:
        relay = await db.relays.find_one({"_id": ObjectId(relay_id)})
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid relay ID.")

    if not relay:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Relay not found.")

    # Enrich with donor info
    donor = await db.users.find_one(
        {"_id": relay["donor_id"]},
        {"org_name": 1, "address.city": 1, "phone": 1, "email": 1},
    )
    if donor:
        relay["donor_info"] = {
            "org_name": donor.get("org_name", "Anonymous Donor"),
            "city": donor.get("address", {}).get("city", ""),
        }
        # Only show contact info if relay is claimed by this user
        if relay.get("claimed_by") == user["_id"]:
            relay["donor_info"]["phone"] = donor.get("phone")
            relay["donor_info"]["email"] = donor.get("email")

    return {"relay": _serialize_relay(relay)}


# ─────────────────────────────────────────────────────────────
# PUT /api/relays/:id — Edit relay
# ─────────────────────────────────────────────────────────────
@router.put("/{relay_id}")
async def update_relay(
    relay_id: str,
    payload: RelayUpdate,
    user: dict = Depends(require_donor),
):
    """Edit a relay (only if active and unclaimed)."""
    db = get_db()
    try:
        relay = await db.relays.find_one({"_id": ObjectId(relay_id)})
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid relay ID.")

    if not relay:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Relay not found.")
    if relay["donor_id"] != user["_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your relay!")
    if relay["status"] != "active":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only active relays can be edited.")
    if relay.get("claimed_by"):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cannot edit a claimed relay.")

    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nothing to update.")

    # Convert nested Pydantic models to dicts
    for key in ("pickup_address", "pickup_location", "pickup_window", "quantity"):
        if key in update_data and hasattr(update_data[key], "model_dump"):
            update_data[key] = update_data[key].model_dump()
        elif key in update_data and isinstance(update_data[key], dict):
            pass  # already a dict

    update_data["updated_at"] = datetime.utcnow()
    await db.relays.update_one({"_id": ObjectId(relay_id)}, {"$set": update_data})

    updated = await db.relays.find_one({"_id": ObjectId(relay_id)})
    return {
        "message": "Relay updated! 📝",
        "relay": _serialize_relay(updated),
    }


# ─────────────────────────────────────────────────────────────
# DELETE /api/relays/:id — Cancel relay
# ─────────────────────────────────────────────────────────────
@router.delete("/{relay_id}")
async def cancel_relay(relay_id: str, user: dict = Depends(require_donor)):
    """Cancel a relay (only if active and unclaimed)."""
    db = get_db()
    try:
        relay = await db.relays.find_one({"_id": ObjectId(relay_id)})
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid relay ID.")

    if not relay:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Relay not found.")
    if relay["donor_id"] != user["_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your relay!")
    if relay["status"] != "active":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only active relays can be cancelled.")
    if relay.get("claimed_by"):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cannot cancel a claimed relay.")

    await db.relays.update_one(
        {"_id": ObjectId(relay_id)},
        {"$set": {"status": "cancelled", "updated_at": datetime.utcnow()}},
    )

    # Optionally delete photo from Cloudinary to save storage
    try:
        if relay.get("photo", {}).get("cloudinary_public_id"):
            delete_photo(relay["photo"]["cloudinary_public_id"])
    except Exception:
        pass

    return {"message": "Relay cancelled. Maybe next time! 🙏"}


# ─────────────────────────────────────────────────────────────
# POST /api/relays/:id/claim — Claim a relay
# ─────────────────────────────────────────────────────────────
@router.post("/{relay_id}/claim")
async def claim_relay(
    relay_id: str,
    background_tasks: BackgroundTasks,
    recipient: dict = Depends(require_recipient),
):
    """
    Claim an active relay.
    - Lazy expiry check (pickup_window.end > now)
    - Lazy free-tier monthly counter reset
    - Sends email notification to donor (BackgroundTask)
    """
    db = get_db()
    now = datetime.utcnow()
    settings = get_settings()

    try:
        relay = await db.relays.find_one({"_id": ObjectId(relay_id)})
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid relay ID.")

    if not relay:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Relay not found.")

    # ── Lazy expiry check ──
    if relay["pickup_window"]["end"] < now:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This relay has sailed. Better luck next time! ⏰",
        )

    if relay["status"] != "active":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This relay has already been claimed.",
        )

    # ── Free-tier: lazy monthly counter reset ──
    sub_plan = recipient.get("subscription", {}).get("plan", "free")

    # Check subscription expiry inline
    sub_expires = recipient.get("subscription", {}).get("expires_at")
    if sub_expires and sub_expires < now and sub_plan != "free":
        await db.users.update_one(
            {"_id": recipient["_id"]},
            {"$set": {"subscription.plan": "free", "subscription.status": "expired"}},
        )
        sub_plan = "free"

    if sub_plan == "free":
        first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        claims_reset = recipient.get("claims_month_reset", datetime.min)
        if claims_reset < first_of_month:
            await db.users.update_one(
                {"_id": recipient["_id"]},
                {"$set": {"claims_this_month": 0, "claims_month_reset": now}},
            )
            recipient["claims_this_month"] = 0

        if recipient.get("claims_this_month", 0) >= settings.FREE_TIER_MONTHLY_CLAIMS:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Free plan limit reached ({settings.FREE_TIER_MONTHLY_CLAIMS} claims/month). "
                       f"Upgrade to Saathi for unlimited claims! 🚀",
            )

    # ── Proceed with claim ──
    result = await db.relays.update_one(
        {"_id": ObjectId(relay_id), "status": "active"},
        {"$set": {
            "status": "claimed",
            "claimed_by": recipient["_id"],
            "claimed_at": now,
            "updated_at": now,
        }},
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Someone beat you to it! This relay was just claimed. 🏃💨",
        )

    # Increment claim counter for free tier
    if sub_plan == "free":
        await db.users.update_one(
            {"_id": recipient["_id"]},
            {"$inc": {"claims_this_month": 1}},
        )

    # ── Notify donor ──
    donor = await db.users.find_one({"_id": relay["donor_id"]})
    if donor:
        await create_notification(
            user_id=donor["_id"],
            notification_type="relay_claimed",
            title=f"🎉 {recipient.get('org_name', 'A shelter')} claimed your relay!",
            body=f"Your relay '{relay['food_name']}' has been claimed.",
            relay_id=relay["_id"],
        )
        background_tasks.add_task(
            send_relay_claimed_email,
            donor.get("email", ""),
            donor.get("org_name", "Donor"),
            recipient.get("org_name", "A shelter"),
            relay,
        )

    return {
        "message": "Dinner is served! Go feed some smiles. 🎉",
        "pickup_address": relay.get("pickup_address"),
        "pickup_window": relay.get("pickup_window"),
        "donor_phone": donor.get("phone") if donor else None,
    }


# ─────────────────────────────────────────────────────────────
# DELETE /api/relays/:id/claim — Unclaim a relay
# ─────────────────────────────────────────────────────────────
@router.delete("/{relay_id}/claim")
async def unclaim_relay(
    relay_id: str,
    background_tasks: BackgroundTasks,
    recipient: dict = Depends(require_recipient),
):
    """
    Release a claim. Allowed only if > 45 min before pickup window start.
    """
    db = get_db()
    now = datetime.utcnow()

    try:
        relay = await db.relays.find_one({"_id": ObjectId(relay_id)})
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid relay ID.")

    if not relay:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Relay not found.")
    if relay.get("claimed_by") != recipient["_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You haven't claimed this relay.")
    if relay["status"] != "claimed":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Relay is not in claimed state.")

    # Must unclaim > 45 min before pickup window start
    time_until_start = relay["pickup_window"]["start"] - now
    if time_until_start < timedelta(minutes=45):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Too late to unclaim — less than 45 minutes until pickup window. The food is counting on you! 🍽️",
        )

    await db.relays.update_one(
        {"_id": ObjectId(relay_id)},
        {"$set": {
            "status": "active",
            "claimed_by": None,
            "claimed_at": None,
            "updated_at": now,
        }},
    )

    # Decrement claim counter for free tier
    sub_plan = recipient.get("subscription", {}).get("plan", "free")
    if sub_plan == "free":
        await db.users.update_one(
            {"_id": recipient["_id"]},
            {"$inc": {"claims_this_month": -1}},
        )

    # ── Notify donor ──
    donor = await db.users.find_one({"_id": relay["donor_id"]})
    if donor:
        await create_notification(
            user_id=donor["_id"],
            notification_type="relay_claimed",
            title=f"{recipient.get('org_name', 'A shelter')} released your relay",
            body=f"Your relay '{relay['food_name']}' is active again.",
            relay_id=relay["_id"],
        )
        background_tasks.add_task(
            send_relay_unclaimed_email,
            donor.get("email", ""),
            donor.get("org_name", "Donor"),
            recipient.get("org_name", "A shelter"),
            relay.get("food_name", "relay"),
        )

    return {"message": "Relay released. It's back on the board for others. 🔄"}


# ─────────────────────────────────────────────────────────────
# POST /api/relays/:id/confirm — Confirm pickup completion
# ─────────────────────────────────────────────────────────────
@router.post("/{relay_id}/confirm")
async def confirm_relay(
    relay_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
):
    """
    Donor or recipient confirms pickup completed.
    When both confirm → relay status → completed → check badges.
    """
    db = get_db()
    now = datetime.utcnow()

    try:
        relay = await db.relays.find_one({"_id": ObjectId(relay_id)})
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid relay ID.")

    if not relay:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Relay not found.")
    if relay["status"] not in ("claimed", "completed"):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Relay must be claimed first.")

    update_fields = {"updated_at": now}

    if user["role"] == "donor":
        if relay["donor_id"] != user["_id"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your relay!")
        update_fields["donor_confirmed_completion"] = True
    elif user["role"] == "recipient":
        if relay.get("claimed_by") != user["_id"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You haven't claimed this relay.")
        update_fields["recipient_confirmed_completion"] = True
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid role for confirmation.")

    await db.relays.update_one({"_id": ObjectId(relay_id)}, {"$set": update_fields})

    # ── Check if both parties confirmed → mark completed ──
    updated_relay = await db.relays.find_one({"_id": ObjectId(relay_id)})
    if (
        updated_relay.get("donor_confirmed_completion")
        and updated_relay.get("recipient_confirmed_completion")
    ):
        await db.relays.update_one(
            {"_id": ObjectId(relay_id)},
            {"$set": {"status": "completed", "updated_at": now}},
        )

        # ── Check badges for donor ──
        donor = await db.users.find_one({"_id": relay["donor_id"]})
        if donor:
            background_tasks.add_task(check_and_award_badges, donor)

        # Notify both
        await create_notification(
            user_id=relay["donor_id"],
            notification_type="claim_confirmed",
            title="🎉 Relay completed!",
            body=f"Your relay '{relay['food_name']}' was successfully delivered!",
            relay_id=relay["_id"],
        )
        if relay.get("claimed_by"):
            await create_notification(
                user_id=relay["claimed_by"],
                notification_type="claim_confirmed",
                title="🎉 Relay completed!",
                body=f"Relay '{relay['food_name']}' marked as completed!",
                relay_id=relay["_id"],
            )

        return {"message": "Relay completed! You both rock! 🎉🤝 Another meal relayed."}

    return {"message": "Confirmation recorded! Waiting for the other party. ⏳"}
