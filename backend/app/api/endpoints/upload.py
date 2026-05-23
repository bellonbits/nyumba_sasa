from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
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
    request: Request,
    file: UploadFile = File(...),
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session)
) -> Dict[str, Any]:
    user_id = user_data["sub"]
    
    # Check if user exists in our local database (Relaxed role check to support both avatars and listings)
    user_query = select(User).where(User.id == user_id)
    user_profile = (await db.execute(user_query)).scalar_one_or_none()
    
    if not user_profile:
        raise HTTPException(status_code=403, detail="User profile not found")
        
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Read file content safely
    contents = await file.read()
    
    # Note: 5MB limit
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 5MB")

    try:
        # Check if Cloudinary is configured properly before attempting
        if not settings.CLOUDINARY_CLOUD_NAME or not settings.CLOUDINARY_API_KEY or not settings.CLOUDINARY_API_SECRET:
            raise ValueError("Cloudinary credentials are not fully configured")

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
        print(f"Cloudinary upload failed or skipped, falling back to local storage: {e}")
        try:
            import os
            import uuid
            
            # Ensure the local uploads directory is present
            upload_dir = "app/static/uploads"
            os.makedirs(upload_dir, exist_ok=True)
            
            # Generate a unique name for the file
            ext = os.path.splitext(file.filename or "")[1] or ".jpg"
            if len(ext) > 5 or not ext.startswith("."):
                ext = ".jpg"
            unique_filename = f"{uuid.uuid4()}{ext}"
            file_path = os.path.join(upload_dir, unique_filename)
            
            # Write binary data to disk
            with open(file_path, "wb") as buffer:
                buffer.write(contents)
                
            # Build an absolute URL mapping to the local FastAPI static files server
            base_url = str(request.base_url) if request else "http://localhost:8000/"
            if not base_url.endswith("/"):
                base_url += "/"
            local_url = f"{base_url}static/uploads/{unique_filename}"
            
            return {"data": {"url": local_url}, "error": None}
        except Exception as local_err:
            raise HTTPException(
                status_code=500,
                detail=f"Upload failed: Cloudinary error ({str(e)}) and local storage fallback error ({str(local_err)})"
            )

