from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.db.session import get_session
from app.models.base import VisitConfirmation, User, Listing
from app.core.security import verify_supabase_jwt
from app.schemas import APIResponse

router = APIRouter()

@router.post("/confirm", response_model=APIResponse)
async def submit_visit_confirmation(
    payload: dict,
    user_data: dict = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_session)
):
    user_id = user_data["sub"]
    listing_id = payload.get("listing_id")
    
    if not listing_id:
        return APIResponse(data=None, error="listing_id is required")
        
    # Check if listing exists
    listing_query = select(Listing).where(Listing.id == listing_id)
    listing = (await db.execute(listing_query)).scalar_one_or_none()
    
    if not listing:
        return APIResponse(data=None, error="Listing not found")
        
    was_real = payload.get("was_real", True)
    pricing_accurate = payload.get("pricing_accurate", True)
    was_available = payload.get("was_available", True)
    
    # Save the visit feedback
    new_visit = VisitConfirmation(
        user_id=user_id,
        listing_id=listing_id,
        was_real=was_real,
        pricing_accurate=pricing_accurate,
        was_available=was_available
    )
    db.add(new_visit)
    
    # Dynamically update Landlord/Agent's platform reputation!
    agent_id = listing.agent_id
    agent_query = select(User).where(User.id == agent_id)
    agent = (await db.execute(agent_query)).scalar_one_or_none()
    
    if agent:
        # positive feedback raises trust score slightly, negative lowers it heavily
        score_change = 2.0 if (was_real and pricing_accurate and was_available) else -10.0
        agent.trust_score = max(0.0, min(100.0, agent.trust_score + score_change))
        
        # Increment successful rentals if available and real
        if was_available and was_real:
            agent.successful_rentals += 1
            
        db.add(agent)
        
    # Update property verification flags based on positive community reviews!
    if was_real and pricing_accurate:
        listing.property_verified = True
        db.add(listing)
        
    await db.commit()
    return APIResponse(data={"success": True}, message="Post-visit community confirmation feedback registered successfully!")
