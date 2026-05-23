from jose import jwt, JWTError
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_session
from app.models.base import User, UserRole
from sqlmodel import select
import hashlib
import secrets
import datetime

# --- PBKDF2 Password Hashing System (Offline Sandbox friendly, zero compilation dependencies) ---

def get_password_hash(password: str) -> str:
    salt = secrets.token_hex(16)
    hash_bytes = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"{salt}:{hash_bytes.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt, hash_hex = hashed_password.split(":")
        hash_bytes = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return secrets.compare_digest(hash_bytes.hex(), hash_hex)
    except Exception:
        return False

def create_local_jwt(user_id: str, email: str, name: str, phone: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "aud": "authenticated",
        "iss": "supabase",
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=30),
        "user_metadata": {
            "name": name,
            "phone": phone,
            "role": role
        }
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def verify_supabase_jwt(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_session)
) -> dict:
    try:
        payload = jwt.decode(
            token, 
            settings.SUPABASE_JWT_SECRET, 
            algorithms=["HS256"],
            audience="authenticated"
        )
    except JWTError:
        # Graceful development fallback: if using default placeholder secret,
        # decode unverified claims so local developers don't get blocked immediately
        if settings.SUPABASE_JWT_SECRET in ["your-supabase-jwt-secret", "your-jwt-secret"]:
            try:
                payload = jwt.get_unverified_claims(token)
                if not (payload.get("sub") and payload.get("aud") == "authenticated"):
                    raise JWTError()
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )

    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    # Auto-provision user in the database if they don't exist yet
    try:
        query = select(User).where(User.id == user_id)
        user = (await db.execute(query)).scalar_one_or_none()
        if not user:
            metadata = payload.get("user_metadata", {})
            name = metadata.get("name", "")
            phone = metadata.get("phone", "")
            role_str = metadata.get("role", "user")
            role = UserRole.user
            if role_str == "agent":
                role = UserRole.agent
            elif role_str == "admin":
                role = UserRole.admin
                
            new_user = User(
                id=user_id,
                name=name,
                phone=phone,
                role=role
            )
            db.add(new_user)
            await db.commit()
    except Exception as e:
        print(f"Error auto-provisioning user: {e}")
        # Don't block the request if database auto-provisioning fails temporarily
        pass

    return payload
