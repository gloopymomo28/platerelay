from fastapi import APIRouter
from ..database import get_db

router = APIRouter(tags=["Leaderboard"])

@router.get("/")
async def get_leaderboard(limit: int = 10):
    db = get_db()
    
    pipeline = [
        {"$match": {"status": "completed", "quantity.unit": "servings"}},
        {"$group": {
            "_id": "$donor_id",
            "total_meals": {"$sum": "$quantity.value"},
            "total_relays": {"$sum": 1}
        }},
        {"$sort": {"total_meals": -1}},
        {"$limit": limit},
        {"$lookup": {
            "from": "users",
            "localField": "_id",
            "foreignField": "_id",
            "as": "donor"
        }},
        {"$unwind": "$donor"}
    ]
    
    results = await db.relays.aggregate(pipeline).to_list(None)
    
    leaderboard = []
    for r in results:
        donor = r["donor"]
        leaderboard.append({
            "donor_id": str(r["_id"]),
            "org_name": donor.get("org_name", "Unknown Organization"),
            "city": donor.get("address", {}).get("city", "Unknown City"),
            "total_meals": r["total_meals"],
            "total_relays": r["total_relays"],
            "badges": donor.get("badges", [])
        })
        
    return leaderboard
