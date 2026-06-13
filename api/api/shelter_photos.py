from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from bson import ObjectId
from datetime import datetime

from database import get_db
from auth.dependencies import require_recipient
from services.cloudinary_service import upload_shelter_photo

router = APIRouter(tags=["Shelter Photos"])

@router.post("/")
async def upload_photo(
    relay_id: str = Form(...),
    caption: str = Form(None),
    file: UploadFile = File(...),
    recipient = Depends(require_recipient)
):
    db = get_db()
    relay = await db.relays.find_one({"_id": ObjectId(relay_id)})
    
    if not relay:
        raise HTTPException(status_code=404, detail="Relay not found")
        
    if str(relay.get("claimed_by")) != str(recipient["_id"]):
        raise HTTPException(status_code=403, detail="You can only upload photos for relays you claimed")
        
    # Upload to Cloudinary
    photo_result = await upload_shelter_photo(file, str(recipient["_id"]))
    
    doc = {
        "relay_id": ObjectId(relay_id),
        "recipient_id": recipient["_id"],
        "cloudinary_url": photo_result["url"],
        "cloudinary_public_id": photo_result["public_id"],
        "caption": caption,
        "created_at": datetime.utcnow()
    }
    
    res = await db.shelter_photos.insert_one(doc)
    
    return {
        "message": "Photo uploaded successfully! 📸 Thank you for sharing.",
        "id": str(res.inserted_id),
        "url": photo_result["url"]
    }

@router.get("/")
async def get_recent_photos(limit: int = 20):
    db = get_db()
    photos = await db.shelter_photos.find().sort("created_at", -1).limit(limit).to_list(None)
    
    # Populate recipient info
    for p in photos:
        p["_id"] = str(p["_id"])
        p["relay_id"] = str(p["relay_id"])
        p["recipient_id"] = str(p["recipient_id"])
        
        recipient = await db.users.find_one({"_id": ObjectId(p["recipient_id"])})
        if recipient:
            p["recipient_name"] = recipient.get("org_name", "Unknown Shelter")
            
    return photos
