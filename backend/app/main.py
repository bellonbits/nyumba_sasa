from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import listings, users, favorites, messages, upload

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(listings.router, prefix=f"{settings.API_V1_STR}/listings", tags=["listings"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(favorites.router, prefix=f"{settings.API_V1_STR}/favorites", tags=["favorites"])
app.include_router(messages.router, prefix=f"{settings.API_V1_STR}/messages", tags=["messages"])
app.include_router(upload.router, prefix=f"{settings.API_V1_STR}/upload", tags=["upload"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Nyumba Sasa API (FastAPI)",
        "docs": f"{settings.API_V1_STR}/docs"
    }
