"""
PlateRelay — Application Configuration
Reads all environment variables via Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache


class Settings(BaseSettings):
    """Central config — all env vars read here, nowhere else."""

    # ── MongoDB ──────────────────────────────────────────────
    MONGODB_URI: str = Field(..., description="MongoDB Atlas connection string")

    # ── Supabase ─────────────────────────────────────────────
    SUPABASE_URL: str = Field(..., description="Supabase project URL")
    SUPABASE_ANON_KEY: str = Field(..., description="Supabase anon/public key")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(..., description="Supabase service role key")

    # ── Cloudinary ───────────────────────────────────────────
    CLOUDINARY_CLOUD_NAME: str = Field(..., description="Cloudinary cloud name")
    CLOUDINARY_API_KEY: str = Field(..., description="Cloudinary API key")
    CLOUDINARY_API_SECRET: str = Field(..., description="Cloudinary API secret")

    # ── Resend ───────────────────────────────────────────────
    RESEND_API_KEY: str = Field(..., description="Resend API key")
    RESEND_FROM_EMAIL: str = Field(default="noreply@platerelay.in")
    RESEND_FROM_NAME: str = Field(default="PlateRelay")

    # ── Razorpay ─────────────────────────────────────────────
    RAZORPAY_KEY_ID: str = Field(..., description="Razorpay key ID (rzp_test_*)")
    RAZORPAY_KEY_SECRET: str = Field(..., description="Razorpay key secret")
    RAZORPAY_WEBHOOK_SECRET: str = Field(..., description="Razorpay webhook secret")
    RAZORPAY_SAATHI_PLAN_ID: str = Field(..., description="Razorpay plan ID for Saathi")
    RAZORPAY_DAAN_PRO_PLAN_ID: str = Field(..., description="Razorpay plan ID for Daan Pro")

    # ── App settings ─────────────────────────────────────────
    APP_ENV: str = Field(default="development")
    FRONTEND_URL: str = Field(default="https://platerelay.vercel.app")
    DEFAULT_RELAY_RADIUS_KM: float = Field(default=25.0)
    MAX_RELAY_RADIUS_KM: float = Field(default=50.0)
    FREE_TIER_MONTHLY_CLAIMS: int = Field(default=3)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton — parsed once per cold start."""
    return Settings()
