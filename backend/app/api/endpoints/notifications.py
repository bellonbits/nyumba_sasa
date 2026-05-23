from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.db.session import get_session
from app.models.base import Notification
from app.core.security import verify_supabase_jwt
from app.schemas import APIResponse
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

router = APIRouter()


class NotificationCreate(BaseModel):
    type: str = "info"
    title: str
    body: str
    listing_id: Optional[str] = None


@router.get("/", response_model=APIResponse)
async def get_my_notifications(
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session),
):
    user_id = user_data["sub"]
    query = (
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    result = await db.execute(query)
    notifications = result.scalars().all()
    return APIResponse(data=[n.model_dump() for n in notifications])


@router.get("/unread-count", response_model=APIResponse)
async def get_unread_count(
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session),
):
    user_id = user_data["sub"]
    query = select(Notification).where(
        Notification.user_id == user_id,
        Notification.is_read == False,
    )
    result = await db.execute(query)
    count = len(result.scalars().all())
    return APIResponse(data={"count": count})


@router.post("/mark-read", response_model=APIResponse)
async def mark_all_read(
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session),
):
    user_id = user_data["sub"]
    query = select(Notification).where(
        Notification.user_id == user_id,
        Notification.is_read == False,
    )
    result = await db.execute(query)
    unread = result.scalars().all()
    for n in unread:
        n.is_read = True
        db.add(n)
    await db.commit()
    return APIResponse(data={"marked": len(unread)}, message="All notifications marked as read")


@router.patch("/{notification_id}/read", response_model=APIResponse)
async def mark_one_read(
    notification_id: str,
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session),
):
    user_id = user_data["sub"]
    query = select(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == user_id,
    )
    result = await db.execute(query)
    notif = result.scalar_one_or_none()
    if notif:
        notif.is_read = True
        db.add(notif)
        await db.commit()
    return APIResponse(data={"success": True})


@router.post("/", response_model=APIResponse)
async def create_notification(
    payload: NotificationCreate,
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session),
):
    """Create a notification for the authenticated user (self-notification / system use)."""
    user_id = user_data["sub"]
    notif = Notification(
        id=uuid.uuid4().hex,
        user_id=user_id,
        type=payload.type,
        title=payload.title,
        body=payload.body,
        listing_id=payload.listing_id,
    )
    db.add(notif)
    await db.commit()
    await db.refresh(notif)
    return APIResponse(data=notif.model_dump(), message="Notification created")


@router.delete("/all", response_model=APIResponse)
async def delete_all_notifications(
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session),
):
    user_id = user_data["sub"]
    query = select(Notification).where(Notification.user_id == user_id)
    result = await db.execute(query)
    all_notifs = result.scalars().all()
    for n in all_notifs:
        await db.delete(n)
    await db.commit()
    return APIResponse(data={"deleted": len(all_notifs)}, message="All notifications cleared")
