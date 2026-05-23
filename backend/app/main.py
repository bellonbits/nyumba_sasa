from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import listings, users, favorites, messages, upload, auth, visits, notifications

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
)

@app.on_event("startup")
async def on_startup():
    from sqlmodel import SQLModel
    from app.db.session import engine
    from app.models.base import User, Listing, Favorite, Message, VisitConfirmation, Notification # Import to register models
    import sqlalchemy as sa
    db_host = settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else settings.DATABASE_URL
    print(f"Connecting to database: {db_host}")
    # 1. Create all tables first in their own clean transaction
    async with engine.begin() as conn:
        print("Initializing database tables...")
        await conn.run_sync(SQLModel.metadata.create_all)
        print("Database tables initialized successfully.")
    
    # 2. Run column injections in a separate transaction so failures don't abort table creation
    async with engine.begin() as conn:
        try:
            print("Applying dynamic database migrations...")
            # Dynamically inject missing columns to active PostgreSQL tables in Podman
            await conn.execute(sa.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR;"))
            await conn.execute(sa.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR;"))
            
            # Trust & Verification system columns for users
            await conn.execute(sa.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;"))
            await conn.execute(sa.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE;"))
            await conn.execute(sa.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS id_document_type VARCHAR;"))
            await conn.execute(sa.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS id_document_verified BOOLEAN DEFAULT FALSE;"))
            await conn.execute(sa.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS selfie_verified BOOLEAN DEFAULT FALSE;"))
            
            # Reputation scoring system columns for users
            await conn.execute(sa.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS trust_score FLOAT DEFAULT 90.0;"))
            await conn.execute(sa.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS response_rate FLOAT DEFAULT 100.0;"))
            await conn.execute(sa.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS successful_rentals INTEGER DEFAULT 0;"))
            await conn.execute(sa.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS cancellation_rate FLOAT DEFAULT 0.0;"))
            
            # Trust & Verification system columns for listings
            await conn.execute(sa.text("ALTER TABLE listings ADD COLUMN IF NOT EXISTS property_verified BOOLEAN DEFAULT FALSE;"))
            await conn.execute(sa.text("ALTER TABLE listings ADD COLUMN IF NOT EXISTS owner_verified BOOLEAN DEFAULT FALSE;"))
            await conn.execute(sa.text("ALTER TABLE listings ADD COLUMN IF NOT EXISTS gps_lat FLOAT;"))
            await conn.execute(sa.text("ALTER TABLE listings ADD COLUMN IF NOT EXISTS gps_lng FLOAT;"))
            await conn.execute(sa.text("ALTER TABLE listings ADD COLUMN IF NOT EXISTS caretaker_confirmed BOOLEAN DEFAULT FALSE;"))
            await conn.execute(sa.text("ALTER TABLE listings ADD COLUMN IF NOT EXISTS last_confirmed_available TIMESTAMP DEFAULT NOW();"))
            await conn.execute(sa.text("ALTER TABLE listings ADD COLUMN IF NOT EXISTS auto_expire_at TIMESTAMP;"))
            print("Database migrations applied successfully.")
        except Exception as e:
            print(f"Startup migration: columns may already exist or error: {e}")


# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(listings.router, prefix=f"{settings.API_V1_STR}/listings", tags=["listings"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(favorites.router, prefix=f"{settings.API_V1_STR}/favorites", tags=["favorites"])
app.include_router(messages.router, prefix=f"{settings.API_V1_STR}/messages", tags=["messages"])
app.include_router(upload.router, prefix=f"{settings.API_V1_STR}/upload", tags=["upload"])
app.include_router(visits.router, prefix=f"{settings.API_V1_STR}/visits", tags=["visits"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["notifications"])

# Mount static files for local filesystem fallback upload
from fastapi.staticfiles import StaticFiles
try:
    os.makedirs("app/static/uploads", exist_ok=True)
except OSError as e:
    print(f"Skipping static folder creation in read-only filesystem (e.g. Vercel): {e}")
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/")
async def root():
    return {
        "message": "Welcome to Nyumba Sasa API (FastAPI)",
        "docs": f"{settings.API_V1_STR}/docs"
    }
