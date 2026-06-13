from fastapi import APIRouter, HTTPException
from bson import ObjectId

from ..database import get_db
from ..services.report_service import calculate_co2_saved

router = APIRouter(tags=["Profiles"])

@router.get("/{user_id}")
async def get_public_profile(user_id: str):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    profile = {
        "id": str(user["_id"]),
        "org_name": user.get("org_name", "Unknown Organization"),
        "city": user.get("address", {}).get("city", "Unknown City"),
        "role": user.get("role"),
        "verification_status": user.get("verification_status"),
        "badges": user.get("badges", []),
        "join_date": user.get("created_at"),
        "trust_badges": []
    }
    
    if profile["verification_status"] == "verified":
        if profile["role"] == "donor":
            profile["trust_badges"].append("Verified Donor")
        elif profile["role"] == "recipient":
            profile["trust_badges"].append("Verified Shelter")
            
    if user.get("subscription", {}).get("plan") == "saathi" and user.get("subscription", {}).get("status") == "active":
        profile["trust_badges"].append("Saathi Partner")
        
    if profile["role"] == "donor":
        # Get donor stats
        completed_relays = await db.relays.find({"donor_id": user["_id"], "status": "completed"}).to_list(None)
        total_meals = sum(r.get("quantity", {}).get("value", 0) for r in completed_relays if r.get("quantity", {}).get("unit") == "servings")
        
        profile["total_relays"] = len(completed_relays)
        profile["total_meals"] = total_meals
        profile["co2_saved"] = calculate_co2_saved(completed_relays)
        
        if profile["total_relays"] >= 10:
            profile["trust_badges"].append("Trusted Donor")
        if profile["total_relays"] >= 50:
            profile["trust_badges"].append("Champion Donor")
            
    elif profile["role"] == "recipient":
        # Get recipient stats
        claimed_relays = await db.relays.find({"claimed_by": user["_id"], "status": "completed"}).to_list(None)
        total_meals = sum(r.get("quantity", {}).get("value", 0) for r in claimed_relays if r.get("quantity", {}).get("unit") == "servings")
        
        profile["total_relays"] = len(claimed_relays)
        profile["total_meals"] = total_meals
        
        # Get recent shelter photos
        recent_photos = await db.shelter_photos.find({"recipient_id": user["_id"]}).sort("created_at", -1).limit(6).to_list(None)
        for p in recent_photos:
            p["_id"] = str(p["_id"])
            p["relay_id"] = str(p["relay_id"])
            p["recipient_id"] = str(p["recipient_id"])
        profile["recent_shelter_photos"] = recent_photos

    return profile
