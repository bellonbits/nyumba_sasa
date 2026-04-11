from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from app.models.base import UserRole, ListingStatus, ListingType

# Generic Response Schema
class APIResponse(BaseModel):
    data: Any
    error: Optional[str] = None
    message: Optional[str] = None
    
# ---- Listing Schemas ----

class ListingCreate(BaseModel):
    title: str
    description: str
    price: float
    listing_type: ListingType
    location: str
    city: str
    bedrooms: int = 1
    bathrooms: int = 1
    area_sqm: Optional[float] = None
    images: List[str] = []
    amenities: List[str] = []

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    listing_type: Optional[ListingType] = None
    location: Optional[str] = None
    city: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area_sqm: Optional[float] = None
    images: Optional[List[str]] = None
    amenities: Optional[List[str]] = None

class ListingStatusUpdate(BaseModel):
    status: ListingStatus

# ---- User Schemas ----

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

# ---- Message Schemas ----

class MessageCreate(BaseModel):
    receiver_id: str
    listing_id: str
    text: str
