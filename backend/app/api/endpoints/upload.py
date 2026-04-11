from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import Dict, Any

from app.db.session import get_session
from app.models.base import User
from app.core.security import verify_supabase_jwt
from app.core.config import settings

import cloudinary
import cloudinary.uploader

router = APIRouter()

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

@router.post("/", status_code=201)
async def upload_image(
    file: UploadFile = File(...),
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session)
) -> Dict[str, Any]:
    user_id = user_data["sub"]
    
    # Check if user is agent or admin
    user_query = select(User).where(User.id == user_id)
    user_profile = (await db.execute(user_query)).scalar_one_or_none()
    
    if not user_profile or user_profile.role not in ["agent", "admin"]:
        raise HTTPException(status_code=403, detail="Only agents can upload images")
        
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Read file content safely
    contents = await file.read()
    
    # Note: 5MB limit
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 5MB")

    try:
        result = cloudinary.uploader.upload(
            contents,
            folder="nyumba-sasa/listings",
            transformation=[
                {"width": 800, "crop": "limit"},
                {"quality": "auto:good"},
                {"fetch_format": "auto"}
            ]
        )
        return {"data": {"url": result.get("secure_url")}, "error": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
