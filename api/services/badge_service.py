"""
PlateRelay — Badge Service
On-demand badge computation for the Donor Rewards System.

Badges are computed when:
  - A profile is viewed (public or own)
  - A relay is completed
  - The badge check endpoint is hit

Badge definitions:
  first_relay        — 1 completed relay
  hunger_hero        — 10 completed relays
  food_champion      — 25 completed relays
  platerelay_legend  — 50 completed relays
  consistency_king   — 7 consecutive days with ≥ 1 relay posted
  community_pillar   — donated to 10+ unique recipients
  century_club       — 100+ total meals donated
  verified_donor     — admin-verified account
  trusted_donor      — 10+ completed relays, zero disputes
  champion_donor     — 50+ completed relays
  saathi_partner     — active Saathi subscriber

All badges are stored in the user document under 'badges' array:
  [{ "type": "first_relay", "earned_at": ISODate }, ...]
"""

from datetime import datetime, timedelta
from collections import defaultdict

from bson import ObjectId

from database import get_db
from models.common import BadgeType, BADGE_DISPLAY
from services.report_service import calculate_total_meals


async def check_and_award_badges(user: dict) -> list[dict]:
    """
    Compute all eligible badges for a user on-demand.
    Awards any new badges not already in the user's badge array.
    Returns list of newly awarded badges (for notification purposes).
    """
    db = get_db()
    user_id = user["_id"]
    existing_badges = {b["type"] for b in user.get("badges", [])}
    new_badges: list[dict] = []

    # ── Only donors earn most badges ──
    if user.get("role") != "donor":
        # Recipients can earn saathi_partner
        if user.get("role") == "recipient":
            sub = user.get("subscription", {})
            if (
                sub.get("plan") == "saathi"
                and sub.get("status") == "active"
                and BadgeType.SAATHI_PARTNER not in existing_badges
            ):
                badge = _make_badge(BadgeType.SAATHI_PARTNER)
                new_badges.append(badge)

        if new_badges:
            await _save_badges(db, user_id, new_badges)
        return new_badges

    # ── Fetch donor's completed relays ──
    completed_relays = await db.relays.find({
        "donor_id": user_id,
        "status": {"$in": ["claimed", "completed"]},
    }).to_list(None)

    completed_count = len(completed_relays)
    total_meals = calculate_total_meals(completed_relays)

    # ── 1. Milestone badges (completed relay count) ──
    milestone_badges = [
        (BadgeType.FIRST_RELAY, 1),
        (BadgeType.HUNGER_HERO, 10),
        (BadgeType.FOOD_CHAMPION, 25),
        (BadgeType.PLATERELAY_LEGEND, 50),
    ]
    for badge_type, threshold in milestone_badges:
        if completed_count >= threshold and badge_type not in existing_badges:
            new_badges.append(_make_badge(badge_type))
            existing_badges.add(badge_type)

    # ── 2. Century Club (100+ meals) ──
    if total_meals >= 100 and BadgeType.CENTURY_CLUB not in existing_badges:
        new_badges.append(_make_badge(BadgeType.CENTURY_CLUB))
        existing_badges.add(BadgeType.CENTURY_CLUB)

    # ── 3. Community Pillar (10+ unique recipients) ──
    unique_recipients = set()
    for r in completed_relays:
        if r.get("claimed_by"):
            unique_recipients.add(str(r["claimed_by"]))
    if len(unique_recipients) >= 10 and BadgeType.COMMUNITY_PILLAR not in existing_badges:
        new_badges.append(_make_badge(BadgeType.COMMUNITY_PILLAR))
        existing_badges.add(BadgeType.COMMUNITY_PILLAR)

    # ── 4. Consistency King (7 consecutive days) ──
    if BadgeType.CONSISTENCY_KING not in existing_badges:
        if _check_consecutive_days(completed_relays, days=7):
            new_badges.append(_make_badge(BadgeType.CONSISTENCY_KING))
            existing_badges.add(BadgeType.CONSISTENCY_KING)

    # ── 5. Verified Donor ──
    if (
        user.get("verification_status") == "verified"
        and BadgeType.VERIFIED_DONOR not in existing_badges
    ):
        new_badges.append(_make_badge(BadgeType.VERIFIED_DONOR))
        existing_badges.add(BadgeType.VERIFIED_DONOR)

    # ── 6. Trusted Donor (10+ completed, 0 disputes) ──
    if completed_count >= 10 and BadgeType.TRUSTED_DONOR not in existing_badges:
        dispute_count = await db.disputes.count_documents({
            "reported_by": {"$ne": user_id},
            "relay_id": {"$in": [r["_id"] for r in completed_relays]},
            "report_type": "food_quality",
        })
        if dispute_count == 0:
            new_badges.append(_make_badge(BadgeType.TRUSTED_DONOR))
            existing_badges.add(BadgeType.TRUSTED_DONOR)

    # ── 7. Champion Donor (50+ completed) ──
    if completed_count >= 50 and BadgeType.CHAMPION_DONOR not in existing_badges:
        new_badges.append(_make_badge(BadgeType.CHAMPION_DONOR))
        existing_badges.add(BadgeType.CHAMPION_DONOR)

    # ── 8. Saathi Partner ──
    sub = user.get("subscription", {})
    if (
        sub.get("plan") in ("saathi", "daan_pro")
        and sub.get("status") == "active"
        and BadgeType.SAATHI_PARTNER not in existing_badges
    ):
        new_badges.append(_make_badge(BadgeType.SAATHI_PARTNER))
        existing_badges.add(BadgeType.SAATHI_PARTNER)

    # ── Save new badges ──
    if new_badges:
        await _save_badges(db, user_id, new_badges)

    return new_badges


def _check_consecutive_days(relays: list[dict], days: int = 7) -> bool:
    """Check if there are `days` consecutive days each with ≥ 1 relay."""
    if not relays:
        return False

    # Group relays by date
    dates_with_relays: set[str] = set()
    for relay in relays:
        created = relay.get("created_at")
        if created:
            dates_with_relays.add(created.strftime("%Y-%m-%d"))

    if len(dates_with_relays) < days:
        return False

    # Sort dates and check for consecutive runs
    sorted_dates = sorted(dates_with_relays)
    consecutive = 1
    for i in range(1, len(sorted_dates)):
        current = datetime.strptime(sorted_dates[i], "%Y-%m-%d")
        previous = datetime.strptime(sorted_dates[i - 1], "%Y-%m-%d")
        if (current - previous).days == 1:
            consecutive += 1
            if consecutive >= days:
                return True
        else:
            consecutive = 1

    return consecutive >= days


def _make_badge(badge_type: BadgeType) -> dict:
    """Create a badge document for storage."""
    display = BADGE_DISPLAY.get(badge_type, {})
    return {
        "type": badge_type.value,
        "name": display.get("name", badge_type.value),
        "emoji": display.get("emoji", "🏅"),
        "description": display.get("description", ""),
        "earned_at": datetime.utcnow(),
    }


async def _save_badges(db, user_id: ObjectId, new_badges: list[dict]):
    """Append new badges to user document."""
    await db.users.update_one(
        {"_id": user_id},
        {"$push": {"badges": {"$each": new_badges}}},
    )


async def get_user_badges(user: dict) -> list[dict]:
    """Return the user's current badges, computing any new ones first."""
    await check_and_award_badges(user)
    # Re-fetch to get latest
    db = get_db()
    updated = await db.users.find_one({"_id": user["_id"]}, {"badges": 1})
    return updated.get("badges", [])


async def get_trust_badges(user: dict) -> list[dict]:
    """
    Return trust-level badges for display on relay cards and profiles.
    These are the spec-defined trust badges:
      ✅ Verified Donor, ⭐ Trusted Donor, 🏆 Champion Donor, 🤝 Saathi Partner
    """
    all_badges = await get_user_badges(user)
    trust_types = {
        BadgeType.VERIFIED_DONOR.value,
        BadgeType.TRUSTED_DONOR.value,
        BadgeType.CHAMPION_DONOR.value,
        BadgeType.SAATHI_PARTNER.value,
    }
    return [b for b in all_badges if b.get("type") in trust_types]
