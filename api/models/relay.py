"""
PlateRelay — Relay Pydantic Models
Request / response schemas for relay (food listing) endpoints.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from models.common import FoodCategory, QuantityUnit, VegStatus


# ── Nested schemas ──────────────────────────────────────────

class Quantity(BaseModel):
    value: float = Field(..., gt=0)
    unit: QuantityUnit


class PhotoInfo(BaseModel):
    cloudinary_url: str
    cloudinary_public_id: str
    thumbnail_url: str


class PickupAddress(BaseModel):
    street: str = Field(..., min_length=1, max_length=500)
    city: str = Field(..., min_length=1, max_length=100)
    instructions: Optional[str] = Field(None, max_length=500)


class PickupLocation(BaseModel):
    type: str = Field(default="Point")
    coordinates: list[float] = Field(
        ...,
        min_length=2,
        max_length=2,
        description="[longitude, latitude]",
    )


class PickupWindow(BaseModel):
    start: datetime
    end: datetime


# ── Request Models ──────────────────────────────────────────

class RelayCreate(BaseModel):
    """Fields submitted when posting a new relay."""
    food_name: str = Field(..., min_length=2, max_length=200)
    category: FoodCategory
    quantity: Quantity
    is_vegetarian: VegStatus
    allergens: list[str] = Field(default_factory=list)
    notes: Optional[str] = Field(None, max_length=1000)
    pickup_address: PickupAddress
    pickup_location: PickupLocation
    pickup_window: PickupWindow
    quality_pledge_confirmed: bool = Field(
        ..., description="Must be True — donor confirms food safety pledge"
    )


class RelayUpdate(BaseModel):
    """Editable relay fields (only if active + unclaimed)."""
    food_name: Optional[str] = Field(None, min_length=2, max_length=200)
    category: Optional[FoodCategory] = None
    quantity: Optional[Quantity] = None
    is_vegetarian: Optional[VegStatus] = None
    allergens: Optional[list[str]] = None
    notes: Optional[str] = Field(None, max_length=1000)
    pickup_address: Optional[PickupAddress] = None
    pickup_location: Optional[PickupLocation] = None
    pickup_window: Optional[PickupWindow] = None


# ── Response Models ─────────────────────────────────────────

class RelayResponse(BaseModel):
    """Full relay document returned to the client."""
    id: str
    donor_id: str
    food_name: str
    category: FoodCategory
    quantity: dict
    is_vegetarian: str
    allergens: list[str] = []
    notes: Optional[str] = None
    photo: dict
    pickup_address: dict
    pickup_location: dict
    pickup_window: dict
    status: str
    claimed_by: Optional[str] = None
    claimed_at: Optional[datetime] = None
    donor_confirmed_completion: bool = False
    recipient_confirmed_completion: bool = False
    quality_pledge_confirmed: bool = True
    distance_meters: Optional[float] = None
    donor_info: Optional[dict] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
