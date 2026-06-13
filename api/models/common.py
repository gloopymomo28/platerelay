"""
PlateRelay — Shared Enums & Base Models
Every enum used across the platform lives here.
"""

from enum import str, Enum


class Role(str, Enum):
    DONOR = "donor"
    RECIPIENT = "recipient"
    ADMIN = "admin"


class VerificationStatus(str, Enum):
    PENDING_EMAIL = "pending_email"
    PENDING_DOCS = "pending_docs"
    PENDING_VERIFICATION = "pending_verification"
    VERIFIED = "verified"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class RelayStatus(str, Enum):
    ACTIVE = "active"
    CLAIMED = "claimed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class FoodCategory(str, Enum):
    COOKED_MEAL = "cooked_meal"
    PACKAGED = "packaged"
    BAKERY = "bakery"
    RAW_PRODUCE = "raw_produce"
    OTHER = "other"


class QuantityUnit(str, Enum):
    SERVINGS = "servings"
    KG = "kg"
    ITEMS = "items"


class VegStatus(str, Enum):
    VEG = "true"
    NON_VEG = "false"
    MIXED = "mixed"


class DocType(str, Enum):
    FSSAI = "fssai"
    GST = "gst"
    TRADE_LICENSE = "trade_license"
    NGO_CERT = "ngo_cert"
    TRUST_DEED = "trust_deed"
    AADHAAR = "aadhaar"
    EIGHTY_G = "80g"


class DisputeType(str, Enum):
    FOOD_QUALITY = "food_quality"
    NO_SHOW_DONOR = "no_show_donor"
    NO_SHOW_RECIPIENT = "no_show_recipient"
    QUANTITY_MISMATCH = "quantity_mismatch"
    OTHER = "other"


class DisputeStatus(str, Enum):
    OPEN = "open"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"


class SubscriptionPlan(str, Enum):
    FREE = "free"
    SAATHI = "saathi"
    DAAN_PRO = "daan_pro"


class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class BadgeType(str, Enum):
    FIRST_RELAY = "first_relay"
    HUNGER_HERO = "hunger_hero"
    FOOD_CHAMPION = "food_champion"
    PLATERELAY_LEGEND = "platerelay_legend"
    CONSISTENCY_KING = "consistency_king"
    COMMUNITY_PILLAR = "community_pillar"
    CENTURY_CLUB = "century_club"
    VERIFIED_DONOR = "verified_donor"
    TRUSTED_DONOR = "trusted_donor"
    CHAMPION_DONOR = "champion_donor"
    SAATHI_PARTNER = "saathi_partner"


class NotificationType(str, Enum):
    RELAY_CLAIMED = "relay_claimed"
    NEW_RELAY_NEARBY = "new_relay_nearby"
    ACCOUNT_VERIFIED = "account_verified"
    ACCOUNT_REJECTED = "account_rejected"
    CLAIM_CONFIRMED = "claim_confirmed"
    BADGE_EARNED = "badge_earned"


# ── Badge display metadata ─────────────────────────────────
BADGE_DISPLAY = {
    BadgeType.FIRST_RELAY: {
        "name": "First Relay",
        "emoji": "🌟",
        "description": "Completed your first food relay!",
        "threshold": 1,
    },
    BadgeType.HUNGER_HERO: {
        "name": "Hunger Hero",
        "emoji": "🦸",
        "description": "10 completed relays — you're a hero!",
        "threshold": 10,
    },
    BadgeType.FOOD_CHAMPION: {
        "name": "Food Champion",
        "emoji": "🏅",
        "description": "25 completed relays — true champion!",
        "threshold": 25,
    },
    BadgeType.PLATERELAY_LEGEND: {
        "name": "PlateRelay Legend",
        "emoji": "🏆",
        "description": "50 completed relays — legendary status!",
        "threshold": 50,
    },
    BadgeType.CONSISTENCY_KING: {
        "name": "Consistency King",
        "emoji": "👑",
        "description": "7 consecutive days with at least 1 relay!",
    },
    BadgeType.COMMUNITY_PILLAR: {
        "name": "Community Pillar",
        "emoji": "🏛️",
        "description": "Donated to 10+ unique recipients!",
    },
    BadgeType.CENTURY_CLUB: {
        "name": "Century Club",
        "emoji": "💯",
        "description": "100+ total meals donated!",
    },
    BadgeType.VERIFIED_DONOR: {
        "name": "Verified Donor",
        "emoji": "✅",
        "description": "Admin-approved donor account.",
    },
    BadgeType.TRUSTED_DONOR: {
        "name": "Trusted Donor",
        "emoji": "⭐",
        "description": "10+ completed relays with zero disputes.",
    },
    BadgeType.CHAMPION_DONOR: {
        "name": "Champion Donor",
        "emoji": "🏆",
        "description": "50+ completed relays.",
    },
    BadgeType.SAATHI_PARTNER: {
        "name": "Saathi Partner",
        "emoji": "🤝",
        "description": "Active Saathi subscriber.",
    },
}
