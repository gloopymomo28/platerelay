"""
PlateRelay — Subscriptions API Routes
Razorpay subscription creation, payment verification, and status check.
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import razorpay

from auth.dependencies import require_verified
from database import get_db
from config import get_settings
from services.email_service import send_subscription_activated_email

router = APIRouter(tags=["Subscriptions"])


def _get_razorpay_client() -> razorpay.Client:
    settings = get_settings()
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class SubscriptionCreate(BaseModel):
    plan: str  # "saathi" or "daan_pro"


class PaymentVerify(BaseModel):
    razorpay_payment_id: str
    razorpay_subscription_id: str
    razorpay_signature: str


# ─────────────────────────────────────────────────────────────
# POST /api/subscriptions/create — Create Razorpay subscription
# ─────────────────────────────────────────────────────────────
@router.post("/create")
async def create_subscription(
    payload: SubscriptionCreate,
    user: dict = Depends(require_verified),
):
    """Create a Razorpay subscription for the user."""
    settings = get_settings()

    # ── Determine plan ID ──
    if payload.plan == "saathi":
        plan_id = settings.RAZORPAY_SAATHI_PLAN_ID
        if user.get("role") != "recipient":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Saathi plan is for recipient organizations.",
            )
    elif payload.plan == "daan_pro":
        plan_id = settings.RAZORPAY_DAAN_PRO_PLAN_ID
        if user.get("role") != "donor":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Daan Pro plan is for donor organizations.",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan. Choose 'saathi' or 'daan_pro'.",
        )

    # ── Check for existing active subscription ──
    current_plan = user.get("subscription", {}).get("plan", "free")
    current_status = user.get("subscription", {}).get("status", "")
    if current_plan != "free" and current_status == "active":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have an active subscription.",
        )

    # ── Create Razorpay subscription ──
    client = _get_razorpay_client()
    try:
        subscription = client.subscription.create({
            "plan_id": plan_id,
            "total_count": 12,  # up to 12 months
            "quantity": 1,
            "notes": {
                "user_id": str(user["_id"]),
                "email": user.get("email", ""),
                "plan": payload.plan,
            },
        })
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create subscription: {str(e)}",
        )

    # ── Save subscription ID to user ──
    db = get_db()
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "subscription.razorpay_subscription_id": subscription["id"],
            "updated_at": datetime.utcnow(),
        }},
    )

    return {
        "message": "Subscription created! Complete payment to activate. 💳",
        "subscription_id": subscription["id"],
        "short_url": subscription.get("short_url"),
    }


# ─────────────────────────────────────────────────────────────
# POST /api/subscriptions/verify — Verify payment
# ─────────────────────────────────────────────────────────────
@router.post("/verify")
async def verify_payment(
    payload: PaymentVerify,
    user: dict = Depends(require_verified),
):
    """Verify Razorpay payment signature and activate the subscription."""
    settings = get_settings()
    client = _get_razorpay_client()

    # ── Verify signature ──
    try:
        client.utility.verify_subscription_payment_signature({
            "razorpay_payment_id": payload.razorpay_payment_id,
            "razorpay_subscription_id": payload.razorpay_subscription_id,
            "razorpay_signature": payload.razorpay_signature,
        })
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment verification failed. Signature mismatch.",
        )

    # ── Determine plan from subscription ──
    sub_doc = user.get("subscription", {})
    stored_sub_id = sub_doc.get("razorpay_subscription_id")

    # Fetch subscription details from Razorpay
    try:
        rz_sub = client.subscription.fetch(payload.razorpay_subscription_id)
        plan_id = rz_sub.get("plan_id", "")
    except Exception:
        plan_id = ""

    if plan_id == settings.RAZORPAY_SAATHI_PLAN_ID:
        plan = "saathi"
    elif plan_id == settings.RAZORPAY_DAAN_PRO_PLAN_ID:
        plan = "daan_pro"
    else:
        plan = "saathi"  # fallback

    # ── Activate subscription ──
    db = get_db()
    now = datetime.utcnow()
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "subscription.plan": plan,
            "subscription.status": "active",
            "subscription.razorpay_subscription_id": payload.razorpay_subscription_id,
            "subscription.started_at": now,
            "subscription.expires_at": None,  # managed by webhooks
            "updated_at": now,
        }},
    )

    # ── Send confirmation email ──
    try:
        send_subscription_activated_email(user.get("email", ""), user.get("org_name", ""), plan)
    except Exception:
        pass

    return {
        "message": f"🎉 Your {plan.replace('_', ' ').title()} plan is now active!",
        "plan": plan,
        "status": "active",
    }


# ─────────────────────────────────────────────────────────────
# GET /api/subscriptions/status — Current subscription
# ─────────────────────────────────────────────────────────────
@router.get("/status")
async def get_subscription_status(user: dict = Depends(require_verified)):
    """Get the current user's subscription status."""
    sub = user.get("subscription", {})
    return {
        "plan": sub.get("plan", "free"),
        "status": sub.get("status", "active"),
        "razorpay_subscription_id": sub.get("razorpay_subscription_id"),
        "started_at": sub.get("started_at"),
        "expires_at": sub.get("expires_at"),
    }
