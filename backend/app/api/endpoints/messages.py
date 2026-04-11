from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, or_, and_, desc
from app.db.session import get_session
from app.models.base import Message
from app.core.security import verify_supabase_jwt
import uuid

router = APIRouter()

@router.get("/")
async def get_my_messages(
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session)
):
    user_id = user_data["sub"]
    query = select(Message).where(or_(Message.sender_id == user_id, Message.receiver_id == user_id)).order_by(desc(Message.created_at))
    result = await db.execute(query)
    messages = result.scalars().all()
    return {"data": messages, "error": None}

@router.post("/")
async def send_message(
    payload: dict,
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session)
):
    sender_id = user_data["sub"]
    receiver_id = payload.get("receiver_id")
    listing_id = payload.get("listing_id")
    text = payload.get("text")
    
    if not receiver_id or not listing_id or not text:
        raise HTTPException(status_code=400, detail="Missing fields")
        
    new_msg = Message(
        id=str(uuid.uuid4()),
        sender_id=sender_id,
        receiver_id=receiver_id,
        listing_id=listing_id,
        text=text
    )
    
    db.add(new_msg)
    await db.commit()
    await db.refresh(new_msg)
    
    return {"data": new_msg, "error": None}
