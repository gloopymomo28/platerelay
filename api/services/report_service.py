"""
PlateRelay — Report Service
On-demand impact computation: CO₂ saved, meal counts, report generation.
Based on WRAP (UK) food waste CO₂ equivalency data.
"""

from datetime import datetime
from bson import ObjectId

from database import get_db


# ── CO₂ factors (kg CO₂e per kg food saved) ────────────────
CO2_PER_KG = {
    "cooked_meal": 2.5,
    "packaged": 1.8,
    "bakery": 1.2,
    "raw_produce": 0.9,
    "other": 1.5,
}

# Average weight per serving in kg
KG_PER_SERVING = 0.35


def calculate_co2_saved(relays: list[dict]) -> float:
    """
    Calculate total CO₂e saved from a list of completed/claimed relays.
    Servings are converted to kg at 0.35 kg/serving.
    """
    total = 0.0
    for relay in relays:
        qty = relay.get("quantity", {})
        value = qty.get("value", 0)
        unit = qty.get("unit", "servings")

        kg = value * KG_PER_SERVING if unit == "servings" else value
        category = relay.get("category", "other")
        co2_factor = CO2_PER_KG.get(category, 1.5)
        total += kg * co2_factor

    return round(total, 2)


def calculate_total_meals(relays: list[dict]) -> int:
    """Sum up total meals from relay list."""
    total = 0
    for relay in relays:
        qty = relay.get("quantity", {})
        value = qty.get("value", 0)
        unit = qty.get("unit", "servings")
        if unit == "servings":
            total += int(value)
        elif unit == "kg":
            # Approximate: 1 kg ≈ 3 servings
            total += int(value * 3)
        else:
            total += int(value)
    return total


async def compute_impact_summary(user: dict) -> dict:
    """Compute on-demand impact stats for a user."""
    db = get_db()

    if user["role"] == "donor":
        relays = await db.relays.find({
            "donor_id": user["_id"],
            "status": {"$in": ["claimed", "completed"]},
        }).to_list(None)

        total_meals = calculate_total_meals(relays)
        co2_saved = calculate_co2_saved(relays)

        # Find unique recipients
        unique_recipients = set()
        for r in relays:
            if r.get("claimed_by"):
                unique_recipients.add(str(r["claimed_by"]))

        return {
            "total_relays_posted": len(relays),
            "total_meals_donated": total_meals,
            "co2_kg_saved": co2_saved,
            "unique_recipients": len(unique_recipients),
            "message": "You're making a real impact! Every meal counts. 🌍💚",
        }

    elif user["role"] == "recipient":
        claimed = await db.relays.find({
            "claimed_by": user["_id"],
        }).to_list(None)

        total_meals = calculate_total_meals(claimed)

        # Find unique donors
        unique_donors = set()
        for r in claimed:
            if r.get("donor_id"):
                unique_donors.add(str(r["donor_id"]))

        return {
            "total_relays_claimed": len(claimed),
            "total_meals_received": total_meals,
            "unique_donors": len(unique_donors),
            "message": "Keep claiming — every relay brings a smile. 😊",
        }

    return {}


async def generate_impact_report(user: dict, month: int, year: int) -> dict:
    """
    Generate (or return cached) impact report for a given month/year.
    Stored in impact_reports collection.
    """
    db = get_db()

    # ── Check for existing report ──
    existing = await db.impact_reports.find_one({
        "user_id": user["_id"],
        "month": month,
        "year": year,
    })
    if existing:
        existing["_id"] = str(existing["_id"])
        existing["user_id"] = str(existing["user_id"])
        return existing

    # ── Compute fresh report ──
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)

    if user["role"] == "donor":
        relays = await db.relays.find({
            "donor_id": user["_id"],
            "status": {"$in": ["claimed", "completed"]},
            "created_at": {"$gte": start_date, "$lt": end_date},
        }).to_list(None)

        # Top recipients
        recipient_ids = [r["claimed_by"] for r in relays if r.get("claimed_by")]
        top_partners = []
        if recipient_ids:
            recipients = await db.users.find(
                {"_id": {"$in": list(set(recipient_ids))}},
                {"org_name": 1},
            ).to_list(None)
            top_partners = [r.get("org_name", "Unknown") for r in recipients[:5]]

    else:
        relays = await db.relays.find({
            "claimed_by": user["_id"],
            "created_at": {"$gte": start_date, "$lt": end_date},
        }).to_list(None)

        # Top donors
        donor_ids = [r["donor_id"] for r in relays if r.get("donor_id")]
        top_partners = []
        if donor_ids:
            donors = await db.users.find(
                {"_id": {"$in": list(set(donor_ids))}},
                {"org_name": 1},
            ).to_list(None)
            top_partners = [d.get("org_name", "Unknown") for d in donors[:5]]

    total_meals = calculate_total_meals(relays)
    co2_saved = calculate_co2_saved(relays)

    report = {
        "user_id": user["_id"],
        "month": month,
        "year": year,
        "role": user["role"],
        "total_relays": len(relays),
        "total_meals": total_meals,
        "co2_kg_saved": co2_saved,
        "top_partners": top_partners,
        "pdf_url": None,  # PDF generation can be added later
        "generated_at": datetime.utcnow(),
    }

    result = await db.impact_reports.insert_one(report)
    report["_id"] = str(result.inserted_id)
    report["user_id"] = str(report["user_id"])
    return report
