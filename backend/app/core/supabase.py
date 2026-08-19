from app.core.config import get_settings
from supabase import create_client, Client

settings = get_settings()

_supabase_client: Client | None = None


def get_supabase() -> Client:
    """
    Singleton Supabase client using the service_role key.
    Used for server-side operations (bypasses Row Level Security).
    """
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )
    return _supabase_client


def get_supabase_anon() -> Client:
    """
    Supabase client using the anon key.
    Used for client-safe operations (respects Row Level Security).
    """
    return create_client(
        settings.supabase_url,
        settings.supabase_anon_key,
    )
