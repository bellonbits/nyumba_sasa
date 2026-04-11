import asyncio
import os
from dotenv import load_dotenv

# Load the provided env vars
load_dotenv('env.txt')

from app.models.base import SQLModel
from app.db.session import engine

async def init_db():
    async with engine.begin() as conn:
        # Create all tables securely
        await conn.run_sync(SQLModel.metadata.create_all)
    print("Database tables created successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
