from app.core.config import get_settings  # noqa: F401  (re-export)
from app.core.database import Base, engine, get_db, AsyncSessionLocal  # noqa: F401
from app.core.security import (  # noqa: F401
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
    get_current_user,
    require_student,
    require_teacher,
    require_admin,
)
from app.core.supabase import get_supabase, get_supabase_anon  # noqa: F401
