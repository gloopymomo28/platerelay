"""
PlateRelay — Notifications API Routes
List, mark-read, and mark-all-read for in-app notifications.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from bson import ObjectId

from auth.dependencies import get_current_user
from database import get_db

router = APIRouter(tags=["Notifications"])


@router.get("")
async def list_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
):
    """List my notifications (paginated, newest first)."""
    db = get_db()
    skip = (page - 1) * limit

    query = {"user_id": user["_id"]}
    total = await db.notifications.count_documents(query)
    unread = await db.notifications.count_documents({**query, "is_read": False})

    notifications = (
        await db.notifications.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
        .to_list(limit)
    )

    for n in notifications:
        n["id"] = str(n.pop("_id"))
        if isinstance(n.get("user_id"), ObjectId):
            n["user_id"] = str(n["user_id"])
        if isinstance(n.get("relay_id"), ObjectId):
            n["relay_id"] = str(n["relay_id"])

    return {
        "notifications": notifications,
        "total": total,
        "unread": unread,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


@router.put("/{notification_id}/read")
async def mark_read(notification_id: str, user: dict = Depends(get_current_user)):
    """Mark a single notification as read."""
    db = get_db()
    try:
        result = await db.notifications.update_one(
            {"_id": ObjectId(notification_id), "user_id": user["_id"]},
            {"$set": {"is_read": True}},
        )
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid notification ID.")

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    return {"message": "Marked as read. ✓"}


@router.put("/read-all")
async def mark_all_read(user: dict = Depends(get_current_user)):
    """Mark all notifications as read."""
    db = get_db()
    result = await db.notifications.update_many(
        {"user_id": user["_id"], "is_read": False},
        {"$set": {"is_read": True}},
    )

    return {
        "message": f"All caught up! {result.modified_count} notifications marked as read. 📬",
        "marked": result.modified_count,
    }
