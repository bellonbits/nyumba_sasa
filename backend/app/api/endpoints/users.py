from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.db.session import get_session
from app.models.base import User
from app.core.security import verify_supabase_jwt
from app.schemas import UserUpdate, APIResponse

router = APIRouter()

@router.get("/{user_id}", response_model=APIResponse)
async def get_user_profile(
    user_id: str,
    db: AsyncSession = Depends(get_session)
):
    query = select(User).where(User.id == user_id)
    user = (await db.execute(query)).scalar_one_or_none()
    
    if not user:
        return APIResponse(data=None, error="User not found")
        
    return APIResponse(data=user)

@router.patch("/{user_id}", response_model=APIResponse)
async def update_user_profile(
    user_id: str,
    payload: UserUpdate,
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session)
):
    if user_data["sub"] != user_id:
        return APIResponse(data=None, error="Unauthorized")
        
    query = select(User).where(User.id == user_id)
    user = (await db.execute(query)).scalar_one_or_none()
    
    if not user:
        return APIResponse(data=None, error="User not found")
        
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
            
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return APIResponse(data=user)
