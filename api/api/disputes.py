"""
PlateRelay — Disputes API Routes
File disputes about relays and view filed disputes.
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from pydantic import BaseModel, Field

from auth.dependencies import require_verified
from database import get_db
from models.common import DisputeType
from services.email_service import send_dispute_filed_email

router = APIRouter(tags=["Disputes"])


class DisputeCreate(BaseModel):
    relay_id: str
    report_type: DisputeType
    description: str = Field(..., min_length=10, max_length=2000)


# ─────────────────────────────────────────────────────────────
# POST /api/disputes — File a dispute
# ─────────────────────────────────────────────────────────────
@router.post("", status_code=status.HTTP_201_CREATED)
async def file_dispute(
    payload: DisputeCreate,
    user: dict = Depends(require_verified),
):
    """
    File a dispute about a relay.
    Notifies admin via email. Food quality disputes trigger a flag.
    """
    db = get_db()
    now = datetime.utcnow()

    # ── Validate relay exists ──
    try:
        relay = await db.relays.find_one({"_id": ObjectId(payload.relay_id)})
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid relay ID.")

    if not relay:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Relay not found.")

    # ── Ensure user is involved in this relay ──
    is_donor = relay.get("donor_id") == user["_id"]
    is_recipient = relay.get("claimed_by") == user["_id"]
    if not is_donor and not is_recipient:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only file disputes about relays you're involved in.",
        )

    # ── Check for duplicate dispute ──
    existing = await db.disputes.find_one({
        "relay_id": ObjectId(payload.relay_id),
        "reported_by": user["_id"],
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You've already filed a dispute for this relay.",
        )

    dispute_doc = {
        "relay_id": ObjectId(payload.relay_id),
        "reported_by": user["_id"],
        "report_type": payload.report_type.value,
        "description": payload.description,
        "status": "open",
        "admin_notes": None,
        "created_at": now,
        "resolved_at": None,
    }

    result = await db.disputes.insert_one(dispute_doc)
    dispute_doc["_id"] = str(result.inserted_id)
    dispute_doc["relay_id"] = str(dispute_doc["relay_id"])
    dispute_doc["reported_by"] = str(dispute_doc["reported_by"])

    # ── Notify admin ──
    try:
        # Find an admin to email
        admin = await db.users.find_one({"role": "admin"})
        if admin:
            send_dispute_filed_email(
                admin["email"],
                dispute_doc,
                user.get("org_name", user.get("contact_name", "Unknown")),
            )
    except Exception:
        pass  # Non-critical

    # ── Auto-flag severe disputes (food safety) ──
    if payload.report_type == DisputeType.FOOD_QUALITY:
        # Count recent food quality disputes against this donor
        thirty_days_ago = datetime(now.year, now.month, now.day) - __import__("datetime").timedelta(days=30)
        recent_count = await db.disputes.count_documents({
            "relay_id": {"$in": [r["_id"] async for r in db.relays.find({"donor_id": relay["donor_id"]}, {"_id": 1})]},
            "report_type": "food_quality",
            "created_at": {"$gte": thirty_days_ago},
        })
        # Note: auto-suspension happens at admin discretion, we just flag
        if recent_count >= 2:
            dispute_doc["auto_flag"] = "⚠️ Donor has 2+ food quality disputes in 30 days"

    return {
        "message": "Dispute filed. Our team will review it promptly. 🔍",
        "dispute": dispute_doc,
    }


# ─────────────────────────────────────────────────────────────
# GET /api/disputes/mine — My filed disputes
# ─────────────────────────────────────────────────────────────
@router.get("/mine")
async def my_disputes(user: dict = Depends(require_verified)):
    """List disputes filed by the current user."""
    db = get_db()
    disputes = (
        await db.disputes.find({"reported_by": user["_id"]})
        .sort("created_at", -1)
        .to_list(100)
    )

    for d in disputes:
        d["_id"] = str(d["_id"])
        d["relay_id"] = str(d["relay_id"])
        d["reported_by"] = str(d["reported_by"])

    return {"disputes": disputes}
