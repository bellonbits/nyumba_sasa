import asyncio
from sqlalchemy import inspect
from app.db.session import engine

async def inspect_db():
    def get_columns(conn):
        inspector = inspect(conn)
        for table_name in inspector.get_table_names():
            print(f"\nTable: {table_name}")
            for column in inspector.get_columns(table_name):
                print(f"  - {column['name']} ({column['type']})")

    async with engine.connect() as conn:
        await conn.run_sync(get_columns)

if __name__ == "__main__":
    asyncio.run(inspect_db())
