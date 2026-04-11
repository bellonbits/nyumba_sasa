from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, or_, and_, desc
from app.db.session import get_session
from app.models.base import Message
from app.core.security import verify_supabase_jwt
from app.schemas import MessageCreate, APIResponse
import uuid

router = APIRouter()

@router.get("/", response_model=APIResponse)
async def get_my_messages(
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session)
):
    user_id = user_data["sub"]
    query = select(Message).where(or_(Message.sender_id == user_id, Message.receiver_id == user_id)).order_by(desc(Message.created_at))
    result = await db.execute(query)
    messages = result.scalars().all()
    return APIResponse(data=messages)

@router.post("/", response_model=APIResponse)
async def send_message(
    payload: MessageCreate,
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session)
):
    sender_id = user_data["sub"]
    
    new_msg = Message(
        id=str(uuid.uuid4()),
        sender_id=sender_id,
        receiver_id=payload.receiver_id,
        listing_id=payload.listing_id,
        text=payload.text
    )
    
    db.add(new_msg)
    await db.commit()
    await db.refresh(new_msg)
    
    return APIResponse(data=new_msg)

@router.patch("/{message_id}/read", response_model=APIResponse)
async def mark_message_read(
    message_id: str,
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session)
):
    user_id = user_data["sub"]
    
    query = select(Message).where(and_(Message.id == message_id, Message.receiver_id == user_id))
    message = (await db.execute(query)).scalar_one_or_none()
    
    if not message:
        return APIResponse(data=None, error="Message not found or unauthorized")
        
    message.is_read = True
    db.add(message)
    await db.commit()
    await db.refresh(message)
    
    return APIResponse(data=message)
