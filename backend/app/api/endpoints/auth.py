import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.db.session import get_session
from app.models.base import User
from app.schemas import UserRegister, UserLogin, APIResponse
from app.core.security import get_password_hash, verify_password, create_local_jwt

router = APIRouter()

@router.post("/register", response_model=APIResponse)
async def register(
    payload: UserRegister,
    db: AsyncSession = Depends(get_session)
):
    # Check if user already exists
    query = select(User).where(User.email == payload.email)
    existing_user = (await db.execute(query)).scalar_one_or_none()
    if existing_user:
        return APIResponse(data=None, error="User with this email already exists")

    # Create new user
    user_id = str(uuid.uuid4())
    pw_hash = get_password_hash(payload.password)
    
    new_user = User(
        id=user_id,
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        password_hash=pw_hash,
        role=payload.role
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Generate token
    token = create_local_jwt(
        user_id=new_user.id,
        email=new_user.email,
        name=new_user.name,
        phone=new_user.phone,
        role=new_user.role.value
    )
    
    response_data = {
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "name": new_user.name,
            "phone": new_user.phone,
            "role": new_user.role,
            "avatar_url": new_user.avatar_url,
            "created_at": new_user.created_at.isoformat() if new_user.created_at else None
        },
        "session": {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "name": new_user.name,
                "phone": new_user.phone,
                "role": new_user.role,
                "avatar_url": new_user.avatar_url,
                "created_at": new_user.created_at.isoformat() if new_user.created_at else None
            }
        }
    }
    
    return APIResponse(data=response_data, message="Registration successful")

@router.post("/login", response_model=APIResponse)
async def login(
    payload: UserLogin,
    db: AsyncSession = Depends(get_session)
):
    # Find user by email
    query = select(User).where(User.email == payload.email)
    user = (await db.execute(query)).scalar_one_or_none()
    
    if not user or not user.password_hash:
        return APIResponse(data=None, error="Invalid email or password")
        
    # Verify password
    if not verify_password(payload.password, user.password_hash):
        return APIResponse(data=None, error="Invalid email or password")
        
    # Generate token
    token = create_local_jwt(
        user_id=user.id,
        email=user.email,
        name=user.name,
        phone=user.phone,
        role=user.role.value
    )
    
    response_data = {
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "phone": user.phone,
            "role": user.role,
            "avatar_url": user.avatar_url,
            "created_at": user.created_at.isoformat() if user.created_at else None
        },
        "session": {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "phone": user.phone,
                "role": user.role,
                "avatar_url": user.avatar_url,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
        }
    }
    
    return APIResponse(data=response_data, message="Login successful")
