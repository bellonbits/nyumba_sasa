from enum import Enum
from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship, Column, ARRAY, String, DateTime
import sqlalchemy as sa

class UserRole(str, Enum):
    tenant = "tenant"
    landlord = "landlord"
    agent = "agent"
    admin = "admin"
    user = "user" # Compatibility fallback

class ListingStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class ListingType(str, Enum):
    rent = "rent"
    buy = "buy"

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: str = Field(primary_key=True)
    name: str = Field(default="")
    phone: str = Field(default="")
    email: Optional[str] = Field(default=None)
    password_hash: Optional[str] = Field(default=None)
    role: UserRole = Field(default=UserRole.tenant)
    avatar_url: Optional[str] = Field(default=None, sa_column_kwargs={"name": "avatarUrl"})
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Trust & Verification system columns
    email_verified: bool = Field(default=False)
    identity_verified: bool = Field(default=False)
    id_document_type: Optional[str] = Field(default=None)
    id_document_verified: bool = Field(default=False)
    selfie_verified: bool = Field(default=False)
    
    # Behavioral reputation system columns
    trust_score: float = Field(default=90.0)
    response_rate: float = Field(default=100.0)
    successful_rentals: int = Field(default=0)
    cancellation_rate: float = Field(default=0.0)

    # Relationships
    listings: List["Listing"] = Relationship(back_populates="agent")
    favorites: List["Favorite"] = Relationship(back_populates="user")

class Listing(SQLModel, table=True):
    __tablename__ = "listings"
    
    id: str = Field(default_factory=lambda: str(datetime.utcnow().timestamp()), primary_key=True)
    title: str
    description: str
    price: float
    listing_type: ListingType
    location: str
    city: str
    bedrooms: int = Field(default=1)
    bathrooms: int = Field(default=1)
    area_sqm: Optional[float] = None
    images: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    amenities: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    agent_id: str = Field(foreign_key="users.id")
    status: ListingStatus = Field(default=ListingStatus.pending)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Property trust metrics
    property_verified: bool = Field(default=False)
    owner_verified: bool = Field(default=False)
    gps_lat: Optional[float] = Field(default=None)
    gps_lng: Optional[float] = Field(default=None)
    caretaker_confirmed: bool = Field(default=False)
    last_confirmed_available: datetime = Field(default_factory=datetime.utcnow)
    auto_expire_at: Optional[datetime] = Field(default=None)

    # Relationships
    agent: User = Relationship(back_populates="listings")
    favorites: List["Favorite"] = Relationship(back_populates="listings")

class Favorite(SQLModel, table=True):
    __tablename__ = "favorites"
    
    id: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    listing_id: str = Field(foreign_key="listings.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: User = Relationship(back_populates="favorites")
    listings: Listing = Relationship(back_populates="favorites")

class Message(SQLModel, table=True):
    __tablename__ = "messages"
    
    id: str = Field(primary_key=True)
    sender_id: str = Field(foreign_key="users.id")
    receiver_id: str = Field(foreign_key="users.id")
    listing_id: str = Field(foreign_key="listings.id")
    text: str
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class VisitConfirmation(SQLModel, table=True):
    __tablename__ = "visit_confirmations"
    
    id: str = Field(default_factory=lambda: str(datetime.utcnow().timestamp()), primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    listing_id: str = Field(foreign_key="listings.id")
    was_real: bool = Field(default=True)
    pricing_accurate: bool = Field(default=True)
    was_available: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: str = Field(default_factory=lambda: __import__('uuid').uuid4().hex, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    type: str = Field(default="info")  # info | message | listing | system | promo
    title: str = Field(default="")
    body: str = Field(default="")
    is_read: bool = Field(default=False)
    listing_id: Optional[str] = Field(default=None)  # optional link to a listing
    created_at: datetime = Field(default_factory=datetime.utcnow)

