"""
PlateRelay — Webhooks API Routes
Razorpay webhook handler with HMAC-SHA256 signature verification.
"""

import hmac
import hashlib
import json
from datetime import datetime, timedelta

from fastapi import APIRouter, Request, HTTPException, status

from database import get_db
from config import get_settings
from services.email_service import send_subscription_activated_email, send_subscription_renewed_email

router = APIRouter(tags=["Webhooks"])


def _verify_razorpay_signature(payload_body: bytes, signature: str, secret: str) -> bool:
    """Verify Razorpay webhook HMAC-SHA256 signature."""
    expected = hmac.new(
        secret.encode("utf-8"),
        payload_body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


# ─────────────────────────────────────────────────────────────
# POST /api/webhooks/razorpay — Razorpay webhook
# ─────────────────────────────────────────────────────────────
@router.post("/razorpay")
async def razorpay_webhook(request: Request):
    """
    Handle Razorpay subscription webhook events:
    - subscription.activated → set plan active
    - subscription.charged → extend/renew
    - subscription.cancelled → downgrade to free at period end
    - subscription.completed → downgrade to free
    """
    settings = get_settings()
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    # ── Verify HMAC ──
    if not _verify_razorpay_signature(body, signature, settings.RAZORPAY_WEBHOOK_SECRET):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature.",
        )

    payload = json.loads(body)
    event = payload.get("event", "")
    entity = payload.get("payload", {}).get("subscription", {}).get("entity", {})

    subscription_id = entity.get("id")
    if not subscription_id:
        return {"status": "ignored — no subscription ID"}

    db = get_db()
    now = datetime.utcnow()

    # ── Find user by subscription ID ──
    user = await db.users.find_one({
        "subscription.razorpay_subscription_id": subscription_id,
    })

    if not user:
        return {"status": "ignored — user not found for this subscription"}

    # ── Determine plan from Razorpay plan_id ──
    plan_id = entity.get("plan_id", "")
    if plan_id == settings.RAZORPAY_SAATHI_PLAN_ID:
        plan = "saathi"
    elif plan_id == settings.RAZORPAY_DAAN_PRO_PLAN_ID:
        plan = "daan_pro"
    else:
        plan = user.get("subscription", {}).get("plan", "saathi")

    # ── Handle events ──
    if event == "subscription.activated":
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "subscription.plan": plan,
                "subscription.status": "active",
                "subscription.started_at": now,
                "subscription.expires_at": None,
                "updated_at": now,
            }},
        )
        try:
            send_subscription_activated_email(user["email"], user.get("org_name", ""), plan)
        except Exception:
            pass

    elif event == "subscription.charged":
        # Renew — extend by 30 days
        expires_at = now + timedelta(days=30)
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "subscription.status": "active",
                "subscription.expires_at": expires_at,
                "updated_at": now,
            }},
        )
        month_name = now.strftime("%B %Y")
        try:
            send_subscription_renewed_email(user["email"], user.get("org_name", ""), plan, month_name)
        except Exception:
            pass

    elif event in ("subscription.cancelled", "subscription.completed"):
        # Downgrade to free at period end
        current_end = entity.get("current_end")
        expires_at = datetime.utcfromtimestamp(current_end) if current_end else now

        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "subscription.status": "cancelled",
                "subscription.expires_at": expires_at,
                "updated_at": now,
            }},
        )

    elif event == "subscription.halted":
        # Payment failed repeatedly
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "subscription.status": "expired",
                "subscription.plan": "free",
                "updated_at": now,
            }},
        )

    return {"status": "ok", "event": event}
