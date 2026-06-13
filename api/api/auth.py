"""
PlateRelay — Auth API Routes
Registration, profile completion, document upload, and profile management.
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from bson import ObjectId

from auth.supabase import get_supabase_client, get_supabase_admin
from auth.dependencies import get_current_user
from database import get_db
from models.user import UserCreate, UserCreateFromFrontend, ProfileComplete, UserUpdate, UserResponse
from models.common import DocType, VerificationStatus
from services.cloudinary_service import upload_verification_doc
from services.email_service import send_docs_received_email

router = APIRouter(tags=["Authentication"])


def _serialize_user(user: dict) -> dict:
    """Convert MongoDB user doc to JSON-serializable dict."""
    user["id"] = str(user.pop("_id"))
    if "donor_id" in user and isinstance(user["donor_id"], ObjectId):
        user["donor_id"] = str(user["donor_id"])
    return user


# ─────────────────────────────────────────────────────────────
# POST /api/auth/register
# ─────────────────────────────────────────────────────────────
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreateFromFrontend):
    """
    Register a new user. The frontend has already created the Supabase auth
    user via signUp(), so we receive the supabase_uid directly and just
    create the MongoDB user document.
    """
    db = get_db()

    # ── Guard: don't create duplicate MongoDB docs ──
    existing = await db.users.find_one({"supabase_uid": payload.supabase_uid})
    if existing:
        return {
            "message": "User already registered.",
            "supabase_uid": payload.supabase_uid,
        }

    # ── Create MongoDB user stub ──
    now = datetime.utcnow()

    user_doc = {
        "supabase_uid": payload.supabase_uid,
        "role": payload.role.value,
        "email": payload.email,
        "org_name": payload.org_name or payload.email.split("@")[0],
        "phone": None,
        "contact_name": None,
        "address": None,
        "location": None,
        "verification_status": VerificationStatus.PENDING_EMAIL.value,
        "rejection_reason": None,
        "documents": [],
        "subscription": {
            "plan": "free",
            "status": "active",
            "razorpay_subscription_id": None,
            "started_at": None,
            "expires_at": None,
        },
        "claims_this_month": 0,
        "claims_month_reset": now,
        "badges": [],
        "total_relays": 0,
        "total_meals": 0,
        "co2_saved": 0.0,
        "created_at": now,
        "updated_at": now,
    }

    await db.users.insert_one(user_doc)

    return {
        "message": "Registration successful! Check your email to verify.",
        "supabase_uid": payload.supabase_uid,
    }


# ─────────────────────────────────────────────────────────────
# POST /api/auth/complete-profile
# ─────────────────────────────────────────────────────────────
@router.post("/complete-profile")
async def complete_profile(
    payload: ProfileComplete,
    user: dict = Depends(get_current_user),
):
    """
    Step 2: Fill in org details + location after email verification.
    Sets status to pending_docs.
    """
    db = get_db()
    now = datetime.utcnow()

    update_data = {
        "org_name": payload.org_name,
        "contact_name": payload.contact_name,
        "phone": payload.phone,
        "address": payload.address.model_dump(),
        "location": payload.location.model_dump(),
        "verification_status": VerificationStatus.PENDING_DOCS.value,
        "updated_at": now,
    }

    if payload.org_type:
        update_data["org_type"] = payload.org_type

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": update_data},
    )

    return {
        "message": "Profile completed! Now upload your verification documents. 📄",
    }


# ─────────────────────────────────────────────────────────────
# POST /api/auth/upload-document
# ─────────────────────────────────────────────────────────────
@router.post("/upload-document")
async def upload_document(
    doc_type: DocType = Form(...),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """
    Upload a verification document (FSSAI, GST, NGO cert, etc.).
    Stored in Cloudinary under a per-user private folder.
    """
    # ── Validate file type ──
    allowed_types = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, WebP, or PDF files are accepted.",
        )

    user_id_str = str(user["_id"])
    upload_result = await upload_verification_doc(file, user_id_str)

    doc_info = {
        "doc_type": doc_type.value,
        "cloudinary_url": upload_result["cloudinary_url"],
        "cloudinary_public_id": upload_result["cloudinary_public_id"],
        "uploaded_at": datetime.utcnow(),
    }

    db = get_db()
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$push": {"documents": doc_info},
            "$set": {
                "verification_status": VerificationStatus.PENDING_VERIFICATION.value,
                "updated_at": datetime.utcnow(),
            },
        },
    )

    # ── Send confirmation email ──
    try:
        send_docs_received_email(user.get("email", ""), user.get("org_name", "User"))
    except Exception:
        pass  # Non-critical

    return {
        "message": "Document uploaded! Our team will review it within 24 hours. ⏳",
        "document": doc_info,
    }


# ─────────────────────────────────────────────────────────────
# GET /api/auth/me
# ─────────────────────────────────────────────────────────────
@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Return the current user's full profile."""
    return _serialize_user(user.copy())


# ─────────────────────────────────────────────────────────────
# PUT /api/auth/me
# ─────────────────────────────────────────────────────────────
@router.put("/me")
async def update_me(
    payload: UserUpdate,
    user: dict = Depends(get_current_user),
):
    """Update profile fields (org name, contact, phone, address, location)."""
    db = get_db()
    update_data = payload.model_dump(exclude_none=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nothing to update. Send at least one field.",
        )

    # Convert nested models to dicts
    if "address" in update_data and hasattr(update_data["address"], "model_dump"):
        update_data["address"] = update_data["address"].model_dump()
    if "location" in update_data and hasattr(update_data["location"], "model_dump"):
        update_data["location"] = update_data["location"].model_dump()

    update_data["updated_at"] = datetime.utcnow()

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": update_data},
    )

    updated = await db.users.find_one({"_id": user["_id"]})
    return {
        "message": "Profile updated! Looking sharp. ✨",
        "user": _serialize_user(updated),
    }
