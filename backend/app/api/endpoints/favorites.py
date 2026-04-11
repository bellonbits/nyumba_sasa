from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_
from app.db.session import get_session
from app.models.base import Favorite, Listing
from app.core.security import verify_supabase_jwt
import uuid

router = APIRouter()

@router.get("/")
async def get_my_favorites(
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session)
):
    user_id = user_data["sub"]
    query = select(Favorite).where(Favorite.user_id == user_id)
    result = await db.execute(query)
    favorites = result.scalars().all()
    return {"data": favorites, "error": None}

@router.post("/{listing_id}")
async def toggle_favorite(
    listing_id: str,
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session)
):
    user_id = user_data["sub"]
    
    # Check if exists
    query = select(Favorite).where(and_(Favorite.user_id == user_id, Favorite.listing_id == listing_id))
    existing = (await db.execute(query)).scalar_one_or_none()
    
    if existing:
        await db.delete(existing)
        await db.commit()
        return {"data": None, "message": "Removed from favorites"}
    else:
        new_fav = Favorite(
            id=str(uuid.uuid4()),
            user_id=user_id,
            listing_id=listing_id
        )
        db.add(new_fav)
        await db.commit()
        await db.refresh(new_fav)
        return {"data": new_fav, "message": "Added to favorites"}
