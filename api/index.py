from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from api import (
    auth, relays, notifications, impact, disputes, 
    subscriptions, webhooks, admin, profiles, shelter_photos, leaderboard
)

app = FastAPI(title="PlateRelay API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth")
app.include_router(relays.router, prefix="/api/relays")
app.include_router(notifications.router, prefix="/api/notifications")
app.include_router(impact.router, prefix="/api/impact")
app.include_router(disputes.router, prefix="/api/disputes")
app.include_router(subscriptions.router, prefix="/api/subscriptions")
app.include_router(webhooks.router, prefix="/api/webhooks")
app.include_router(admin.router, prefix="/api/admin")
app.include_router(profiles.router, prefix="/api/profiles")
app.include_router(shelter_photos.router, prefix="/api/shelter-photos")
app.include_router(leaderboard.router, prefix="/api/leaderboard")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "PlateRelay API is running"}

handler = Mangum(app)
