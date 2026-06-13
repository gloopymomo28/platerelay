from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from database import get_db
from auth.dependencies import require_admin
from models.common import VerificationStatus, RelayStatus
from services.email_service import send_account_approved_email, send_account_rejected_email
from pydantic import BaseModel

router = APIRouter(tags=["Admin"])

class VerifyRequest(BaseModel):
    status: VerificationStatus
    reason: Optional[str] = None

@router.get("/users/pending")
async def get_pending_users(admin = Depends(require_admin)):
    db = get_db()
    users = await db.users.find({"verification_status": {"$in": [VerificationStatus.PENDING_DOCS, "pending_verification"]}}).to_list(None)
    for u in users:
        u["_id"] = str(u["_id"])
    return users

@router.put("/users/{user_id}/verify")
async def verify_user(user_id: str, req: VerifyRequest, admin = Depends(require_admin)):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = {
        "verification_status": req.status,
        "updated_at": datetime.utcnow()
    }
    
    if req.status == VerificationStatus.REJECTED:
        update_data["rejection_reason"] = req.reason
        
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    
    if req.status == VerificationStatus.VERIFIED:
        await send_account_approved_email(user["email"], user.get("org_name", "User"))
    elif req.status == VerificationStatus.REJECTED:
        await send_account_rejected_email(user["email"], user.get("org_name", "User"), req.reason or "Documents did not meet requirements.")
        
    return {"message": f"User status updated to {req.status}"}

@router.get("/users")
async def get_all_users(admin = Depends(require_admin)):
    db = get_db()
    users = await db.users.find().to_list(None)
    for u in users:
        u["_id"] = str(u["_id"])
    return users

@router.put("/users/{user_id}/suspend")
async def suspend_user(user_id: str, reason: str, admin = Depends(require_admin)):
    db = get_db()
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"verification_status": VerificationStatus.SUSPENDED, "rejection_reason": reason}}
    )
    return {"message": "User suspended"}

@router.get("/relays")
async def get_all_relays(admin = Depends(require_admin)):
    db = get_db()
    relays = await db.relays.find().to_list(None)
    for r in relays:
        r["_id"] = str(r["_id"])
        r["donor_id"] = str(r["donor_id"])
        if r.get("claimed_by"):
            r["claimed_by"] = str(r["claimed_by"])
    return relays

@router.delete("/relays/{relay_id}")
async def remove_relay(relay_id: str, admin = Depends(require_admin)):
    db = get_db()
    await db.relays.delete_one({"_id": ObjectId(relay_id)})
    return {"message": "Relay removed"}

@router.get("/disputes")
async def get_all_disputes(admin = Depends(require_admin)):
    db = get_db()
    disputes = await db.disputes.find().to_list(None)
    for d in disputes:
        d["_id"] = str(d["_id"])
        d["relay_id"] = str(d["relay_id"])
        d["reported_by"] = str(d["reported_by"])
    return disputes

@router.put("/disputes/{dispute_id}/resolve")
async def resolve_dispute(dispute_id: str, notes: str, admin = Depends(require_admin)):
    db = get_db()
    await db.disputes.update_one(
        {"_id": ObjectId(dispute_id)},
        {"$set": {"status": "resolved", "admin_notes": notes, "resolved_at": datetime.utcnow()}}
    )
    return {"message": "Dispute resolved"}

@router.get("/stats")
async def get_platform_stats(admin = Depends(require_admin)):
    db = get_db()
    total_users = await db.users.count_documents({})
    verified_users = await db.users.count_documents({"verification_status": VerificationStatus.VERIFIED})
    pending_users = await db.users.count_documents({"verification_status": {"$in": [VerificationStatus.PENDING_DOCS, "pending_verification"]}})
    
    total_relays = await db.relays.count_documents({})
    active_relays = await db.relays.count_documents({"status": RelayStatus.ACTIVE, "pickup_window.end": {"$gt": datetime.utcnow()}})
    completed_relays = await db.relays.count_documents({"status": RelayStatus.COMPLETED})
    
    # Calculate total meals
    pipeline = [
        {"$match": {"status": RelayStatus.COMPLETED, "quantity.unit": "servings"}},
        {"$group": {"_id": None, "total": {"$sum": "$quantity.value"}}}
    ]
    meals_result = await db.relays.aggregate(pipeline).to_list(1)
    meals_facilitated = meals_result[0]["total"] if meals_result else 0
    
    saathi_subs = await db.users.count_documents({"subscription.plan": "saathi", "subscription.status": "active"})
    daan_pro_subs = await db.users.count_documents({"subscription.plan": "daan_pro", "subscription.status": "active"})
    
    open_disputes = await db.disputes.count_documents({"status": {"$in": ["open", "under_review"]}})
    
    return {
        "users": {
            "total": total_users,
            "verified": verified_users,
            "pending": pending_users
        },
        "relays": {
            "total": total_relays,
            "active": active_relays,
            "completed": completed_relays,
            "meals_facilitated": meals_facilitated
        },
        "subscriptions": {
            "saathi": saathi_subs,
            "daan_pro": daan_pro_subs,
            "estimated_revenue": (saathi_subs * 149) + (daan_pro_subs * 499)
        },
        "disputes": {
            "open": open_disputes
        }
    }
