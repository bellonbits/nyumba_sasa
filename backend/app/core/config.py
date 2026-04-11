from pydantic import Field
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "Nyumba Sasa API"
    API_V1_STR: str = "/api"
    
    # Supabase Auth
    SUPABASE_URL: str = Field(alias="NEXT_PUBLIC_SUPABASE_URL")
    SUPABASE_ANON_KEY: str = Field(alias="NEXT_PUBLIC_SUPABASE_ANON_KEY")
    SUPABASE_JWT_SECRET: str
    
    # Database (Postgres)
    DATABASE_URL: str

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = Field(alias="NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
