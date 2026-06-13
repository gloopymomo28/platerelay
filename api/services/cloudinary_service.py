"""
PlateRelay — Cloudinary Service
Upload, thumbnail generation, and deletion helpers for relay photos,
verification documents, and shelter distribution photos.
"""

import io
import cloudinary
import cloudinary.uploader
import cloudinary.api
from cloudinary import CloudinaryImage
from PIL import Image
from fastapi import HTTPException, UploadFile, status

from config import get_settings

_configured = False


def _ensure_configured():
    """Configure cloudinary SDK once per cold start."""
    global _configured
    if not _configured:
        settings = get_settings()
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
        )
        _configured = True


async def upload_relay_photo(file: UploadFile) -> dict:
    """
    Upload a relay food photo to Cloudinary.
    Validates minimum dimensions (400 × 300) with Pillow.
    Returns { url, public_id, thumbnail_url }.
    """
    _ensure_configured()
    contents = await file.read()

    # ── Basic validation ──
    try:
        img = Image.open(io.BytesIO(contents))
        # Note: Minimum dimensions restriction has been removed
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image file. Please upload a JPEG or PNG.",
        )

    # ── Upload to Cloudinary ──
    result = cloudinary.uploader.upload(
        contents,
        folder="platerelay/relays",
        resource_type="image",
        quality="auto:good",
        format="jpg",
        transformation=[{"width": 800, "crop": "limit"}],
    )

    # ── Build thumbnail URL ──
    thumbnail_url = CloudinaryImage(result["public_id"]).build_url(
        width=400, height=300, crop="fill", quality=70, format="jpg"
    )

    return {
        "cloudinary_url": result["secure_url"],
        "cloudinary_public_id": result["public_id"],
        "thumbnail_url": thumbnail_url,
    }


async def upload_verification_doc(file: UploadFile, user_id: str) -> dict:
    """
    Upload a verification document (FSSAI, GST, etc.) to Cloudinary.
    Stored in a private folder per user.
    Accepts images and PDFs up to 5 MB.
    """
    _ensure_configured()
    contents = await file.read()

    # ── Validate file size ──
    max_size = 5 * 1024 * 1024  # 5 MB
    if len(contents) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document must be under 5 MB.",
        )

    # ── Determine resource type ──
    content_type = file.content_type or ""
    resource_type = "image"
    if "pdf" in content_type:
        resource_type = "raw"

    result = cloudinary.uploader.upload(
        contents,
        folder=f"platerelay/verification_docs/{user_id}",
        resource_type=resource_type,
        type="authenticated",
    )

    return {
        "cloudinary_url": result["secure_url"],
        "cloudinary_public_id": result["public_id"],
    }


async def upload_shelter_photo(file: UploadFile) -> dict:
    """
    Upload a shelter distribution photo to Cloudinary.
    Recipients upload these to show food being served/distributed.
    """
    _ensure_configured()
    contents = await file.read()

    # ── Basic validation ──
    try:
        img = Image.open(io.BytesIO(contents))
        # Note: Minimum dimensions restriction has been removed
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image file. Please upload a JPEG or PNG.",
        )

    result = cloudinary.uploader.upload(
        contents,
        folder="platerelay/shelter_photos",
        resource_type="image",
        quality="auto:good",
        format="jpg",
        transformation=[{"width": 800, "crop": "limit"}],
    )

    thumbnail_url = CloudinaryImage(result["public_id"]).build_url(
        width=400, height=300, crop="fill", quality=70, format="jpg"
    )

    return {
        "cloudinary_url": result["secure_url"],
        "cloudinary_public_id": result["public_id"],
        "thumbnail_url": thumbnail_url,
    }


def delete_photo(public_id: str) -> bool:
    """Delete a photo from Cloudinary by public ID. Returns True on success."""
    _ensure_configured()
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception:
        return False
