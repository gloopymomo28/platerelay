"""
PlateRelay — Supabase Client Singleton
Lazily initialises the Supabase client once per cold start.
"""

from supabase import create_client, Client
from config import get_settings

_supabase_client: Client | None = None


def get_supabase_client() -> Client:
    """Return a cached Supabase client (anon key)."""
    global _supabase_client
    if _supabase_client is None:
        settings = get_settings()
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    return _supabase_client


_supabase_admin: Client | None = None


def get_supabase_admin() -> Client:
    """Return a cached Supabase admin client (service role key)."""
    global _supabase_admin
    if _supabase_admin is None:
        settings = get_settings()
        _supabase_admin = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    return _supabase_admin
