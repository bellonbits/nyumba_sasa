from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.db.session import get_session
from app.models.base import User
from app.core.security import verify_supabase_jwt

router = APIRouter()

@router.get("/{user_id}")
async def get_user_profile(
    user_id: str,
    db: AsyncSession = Depends(get_session)
):
    query = select(User).where(User.id == user_id)
    user = (await db.execute(query)).scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"data": user, "error": None}

@router.patch("/{user_id}")
async def update_user_profile(
    user_id: str,
    payload: dict,
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session)
):
    if user_data["sub"] != user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    query = select(User).where(User.id == user_id)
    user = (await db.execute(query)).scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    for key, value in payload.items():
        if hasattr(user, key):
            setattr(user, key, value)
            
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return {"data": user, "error": None}
