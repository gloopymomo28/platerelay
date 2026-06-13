"""
PlateRelay — User Pydantic Models
Request / response schemas for user-related endpoints.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from models.common import Role, VerificationStatus, DocType, SubscriptionPlan


# ── Nested schemas ──────────────────────────────────────────

class Address(BaseModel):
    street: str = Field(..., min_length=1, max_length=500)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    pincode: str = Field(..., pattern=r"^\d{6}$")


class GeoLocation(BaseModel):
    type: str = Field(default="Point")
    coordinates: list[float] = Field(
        ...,
        min_length=2,
        max_length=2,
        description="[longitude, latitude]",
    )


class DocumentInfo(BaseModel):
    doc_type: DocType
    cloudinary_url: str
    cloudinary_public_id: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)


class SubscriptionInfo(BaseModel):
    plan: SubscriptionPlan = SubscriptionPlan.FREE
    status: str = "active"
    razorpay_subscription_id: Optional[str] = None
    started_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


# ── Request Models ──────────────────────────────────────────

class UserCreate(BaseModel):
    """Initial registration — minimal fields."""
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: Role = Field(..., description="donor or recipient")


class ProfileComplete(BaseModel):
    """Step 2: fill in org details + location after Supabase signup."""
    org_name: str = Field(..., min_length=2, max_length=200)
    contact_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., pattern=r"^\+?\d{10,15}$")
    address: Address
    location: GeoLocation
    org_type: Optional[str] = Field(
        None,
        description="For recipients: shelter, orphanage, ngo, community_kitchen, etc.",
    )


class UserUpdate(BaseModel):
    """Optional profile update fields."""
    org_name: Optional[str] = Field(None, min_length=2, max_length=200)
    contact_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, pattern=r"^\+?\d{10,15}$")
    address: Optional[Address] = None
    location: Optional[GeoLocation] = None


# ── Response Models ─────────────────────────────────────────

class UserResponse(BaseModel):
    """User profile returned to the client."""
    id: str
    supabase_uid: str
    role: Role
    email: str
    phone: Optional[str] = None
    org_name: Optional[str] = None
    contact_name: Optional[str] = None
    address: Optional[dict] = None
    location: Optional[dict] = None
    verification_status: VerificationStatus
    rejection_reason: Optional[str] = None
    documents: list[dict] = []
    subscription: Optional[dict] = None
    claims_this_month: int = 0
    badges: list[dict] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
