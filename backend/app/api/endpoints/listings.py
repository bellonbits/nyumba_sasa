from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, or_, desc, func
from app.db.session import get_session
from app.models.base import Listing, User, ListingStatus, ListingType
from app.core.security import verify_supabase_jwt
from app.schemas import ListingCreate, ListingUpdate, ListingStatusUpdate, APIResponse
from typing import List, Optional

router = APIRouter()

@router.get("/")
async def get_listings(
    q: Optional[str] = None,
    type: Optional[ListingType] = None,
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_session)
):
    query = select(Listing).where(Listing.status == ListingStatus.approved)

    if q:
        query = query.where(or_(
            Listing.title.ilike(f"%{q}%"),
            Listing.location.ilike(f"%{q}%"),
            Listing.city.ilike(f"%{q}%"),
            Listing.description.ilike(f"%{q}%")
        ))

    if type:
        query = query.where(Listing.listing_type == type)

    if city:
        query = query.where(Listing.city.ilike(f"%{city}%"))

    if min_price is not None:
        query = query.where(Listing.price >= min_price)

    if max_price is not None:
        query = query.where(Listing.price <= max_price)

    if bedrooms is not None:
        query = query.where(Listing.bedrooms >= bedrooms)

    # Pagination
    offset = (page - 1) * limit
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_count = (await db.execute(count_query)).scalar()

    # Get data
    query = query.order_by(desc(Listing.created_at)).offset(offset).limit(limit)
    result = await db.execute(query)
    listings = result.scalars().all()

    return {
        "data": listings,
        "total": total_count,
        "page": page,
        "limit": limit
    }

@router.get("/{id}", response_model=APIResponse)
async def get_listing(
    id: str,
    db: AsyncSession = Depends(get_session)
):
    query = select(Listing).where(Listing.id == id)
    listing = (await db.execute(query)).scalar_one_or_none()
    
    if not listing:
        return APIResponse(data=None, error="Listing not found")
        
    return APIResponse(data=listing)

@router.post("/", status_code=201, response_model=APIResponse)
async def create_listing(
    payload: ListingCreate,
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session)
):
    user_id = user_data["sub"]
    
    # Check if user is agent or admin
    user_query = select(User).where(User.id == user_id)
    user_profile = (await db.execute(user_query)).scalar_one_or_none()
    
    if not user_profile or user_profile.role not in ["agent", "admin"]:
        return APIResponse(data=None, error="Only agents can create listings")

    new_listing = Listing(
        **payload.model_dump(),
        agent_id=user_id,
        status=ListingStatus.pending
    )
    
    db.add(new_listing)
    await db.commit()
    await db.refresh(new_listing)
    
    return APIResponse(data=new_listing)

@router.patch("/{id}", response_model=APIResponse)
async def update_listing(
    id: str,
    payload: ListingUpdate,
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session)
):
    user_id = user_data["sub"]
    
    query = select(Listing).where(Listing.id == id)
    listing = (await db.execute(query)).scalar_one_or_none()
    
    if not listing:
        return APIResponse(data=None, error="Listing not found")
        
    if listing.agent_id != user_id:
        # Check if admin
        user_query = select(User).where(User.id == user_id)
        user_profile = (await db.execute(user_query)).scalar_one_or_none()
        if not user_profile or user_profile.role != "admin":
            return APIResponse(data=None, error="Unauthorized to edit this listing")
            
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(listing, key, value)
        
    db.add(listing)
    await db.commit()
    await db.refresh(listing)
    
    return APIResponse(data=listing)

@router.delete("/{id}", response_model=APIResponse)
async def delete_listing(
    id: str,
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session)
):
    user_id = user_data["sub"]
    
    query = select(Listing).where(Listing.id == id)
    listing = (await db.execute(query)).scalar_one_or_none()
    
    if not listing:
        return APIResponse(data=None, error="Listing not found")
        
    if listing.agent_id != user_id:
        user_query = select(User).where(User.id == user_id)
        user_profile = (await db.execute(user_query)).scalar_one_or_none()
        if not user_profile or user_profile.role != "admin":
            return APIResponse(data=None, error="Unauthorized to delete this listing")
            
    await db.delete(listing)
    await db.commit()
    
    return APIResponse(data={"deleted": True}, message="Listing removed")

@router.patch("/{id}/status", response_model=APIResponse)
async def update_listing_status(
    id: str,
    payload: ListingStatusUpdate,
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session)
):
    user_id = user_data["sub"]
    
    user_query = select(User).where(User.id == user_id)
    user_profile = (await db.execute(user_query)).scalar_one_or_none()
    
    if not user_profile or user_profile.role != "admin":
        return APIResponse(data=None, error="Only admins can change status")
        
    query = select(Listing).where(Listing.id == id)
    listing = (await db.execute(query)).scalar_one_or_none()
    
    if not listing:
        return APIResponse(data=None, error="Listing not found")
        
    listing.status = payload.status
    db.add(listing)
    await db.commit()
    await db.refresh(listing)
    
    return APIResponse(data=listing)
