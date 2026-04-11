from enum import Enum
from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship, Column, ARRAY, String, DateTime
import sqlalchemy as sa

class UserRole(str, Enum):
    user = "user"
    agent = "agent"
    admin = "admin"

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
    role: UserRole = Field(default=UserRole.user)
    avatar_url: Optional[str] = Field(default=None, sa_column_kwargs={"name": "avatarUrl"})
    created_at: datetime = Field(default_factory=datetime.utcnow)

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

    # Relationships
    agent: User = Relationship(back_populates="listings")
    favorites: List["Favorite"] = Relationship(back_populates="listing")

class Favorite(SQLModel, table=True):
    __tablename__ = "favorites"
    
    id: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    listing_id: str = Field(foreign_key="listings.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: User = Relationship(back_populates="favorites")
    listing: Listing = Relationship(back_populates="favorites")

class Message(SQLModel, table=True):
    __tablename__ = "messages"
    
    id: str = Field(primary_key=True)
    sender_id: str = Field(foreign_key="users.id")
    receiver_id: str = Field(foreign_key="users.id")
    listing_id: str = Field(foreign_key="listings.id")
    text: str
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
