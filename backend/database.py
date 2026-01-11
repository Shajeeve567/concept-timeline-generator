import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from  sqlalchemy.orm import declarative_base



load_dotenv()

# Get URL from .env
DATABASE_URL = os.getenv("DATABASE_URL")

# Create th Async Engine
engine = create_async_engine(DATABASE_URL, echo=False)

# Create the async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

# Async Dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session