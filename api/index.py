import sys
import os

# Ensure the api/ directory is on the Python path for Vercel
api_dir = os.path.dirname(os.path.abspath(__file__))
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

app = FastAPI(title="PlateRelay API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check first (before any imports that might fail)
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "PlateRelay API is running"}

# Debug endpoint to help diagnose import issues on Vercel
@app.get("/api/debug")
async def debug_info():
    import importlib
    results = {}
    for mod_name in ["config", "database", "api", "api.auth", "api.relays", "auth", "auth.supabase", "models", "models.common"]:
        try:
            importlib.import_module(mod_name)
            results[mod_name] = "OK"
        except Exception as e:
            results[mod_name] = f"FAIL: {type(e).__name__}: {str(e)}"
    results["sys_path"] = sys.path[:5]
    results["cwd"] = os.getcwd()
    results["api_dir"] = api_dir
    results["dir_contents"] = os.listdir(api_dir)
    return results

# Import routers - wrapped in try/except so health check still works
try:
    from api import (
        auth, relays, notifications, impact, disputes,
        subscriptions, webhooks, admin, profiles, shelter_photos, leaderboard
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
except Exception as e:
    # Store the error so we can report it via the debug endpoint
    _import_error = str(e)
    
    @app.get("/api/import-error")
    async def import_error():
        return {"error": _import_error}

handler = Mangum(app)
