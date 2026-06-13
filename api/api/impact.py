"""
PlateRelay — Impact API Routes
On-demand impact summaries and cached monthly report generation.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from bson import ObjectId

from auth.dependencies import require_verified
from database import get_db
from services.report_service import compute_impact_summary, generate_impact_report

router = APIRouter(tags=["Impact"])


# ─────────────────────────────────────────────────────────────
# GET /api/impact/summary — On-demand impact stats
# ─────────────────────────────────────────────────────────────
@router.get("/summary")
async def get_impact_summary(user: dict = Depends(require_verified)):
    """Compute and return my total impact stats on-demand."""
    summary = await compute_impact_summary(user)
    return summary


# ─────────────────────────────────────────────────────────────
# POST /api/impact/reports/generate — Generate monthly report
# ─────────────────────────────────────────────────────────────
@router.post("/reports/generate")
async def generate_report(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2024, le=2030),
    user: dict = Depends(require_verified),
):
    """Generate (or retrieve cached) impact report for a given month/year."""
    report = await generate_impact_report(user, month, year)
    return {
        "message": "Impact report ready! Every relay counts. 🌍",
        "report": report,
    }


# ─────────────────────────────────────────────────────────────
# GET /api/impact/reports — List my reports
# ─────────────────────────────────────────────────────────────
@router.get("/reports")
async def list_reports(user: dict = Depends(require_verified)):
    """List all generated impact reports for the current user."""
    db = get_db()
    reports = (
        await db.impact_reports.find({"user_id": user["_id"]})
        .sort("generated_at", -1)
        .to_list(100)
    )

    for report in reports:
        report["_id"] = str(report["_id"])
        report["user_id"] = str(report["user_id"])

    return {"reports": reports}
