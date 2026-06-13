"""
PlateRelay — Auth Dependencies
FastAPI dependency functions for role-based access control.
All protected routes inject one of these to get the current user.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from auth.supabase import get_supabase_client
from database import get_db

security = HTTPBearer()


async def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Verify Supabase JWT → look up user in MongoDB.
    Returns the full user document (dict).
    Raises 401 if token is invalid or user doesn't exist.
    """
    try:
        supabase = get_supabase_client()
        auth_response = supabase.auth.get_user(token.credentials)
        if not auth_response or not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token. Please log in again.",
            )
        supabase_uid = auth_response.user.id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed. Token verification error: {str(e)}",
        )

    db = get_db()
    db_user = await db.users.find_one({"supabase_uid": supabase_uid})
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Complete your registration first.",
        )
    return db_user


async def require_verified(user: dict = Depends(get_current_user)) -> dict:
    """Only verified users may proceed.
    NOTE: Verification check temporarily disabled for development/testing.
    Re-enable the status check before going to production.
    """
    # if user.get("verification_status") != "verified":
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Your account is not yet verified. Hang tight — our team is reviewing your docs! 🔍",
    #     )
    return user


async def require_donor(user: dict = Depends(get_current_user)) -> dict:
    """Only donors may proceed."""
    if user.get("role") != "donor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Donor account required. You need a donor hat for this! 🎩",
        )
    return user


async def require_recipient(user: dict = Depends(get_current_user)) -> dict:
    """Only recipients may proceed."""
    if user.get("role") != "recipient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recipient account required.",
        )
    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """Only admins may proceed — no verification check needed."""
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required. Nice try though! 😉",
        )
    return user
