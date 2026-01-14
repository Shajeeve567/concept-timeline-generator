import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from  sqlalchemy.orm import declarative_base


load_dotenv()

# Get URL from .env
DATABASE_URL = os.getenv("DATABASE_URL")

# Create th Async Engine - creates a connection pool
engine = create_async_engine(DATABASE_URL, echo=False)

# Create the async session factory
# what it basically does is -> "Every time we talk, don't auto-commit (wait for me to say 'save'), and use the Engine we just created"
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

# Async Dependency
# Opens connection (async with). Yields it. - a "handle" to talk to the DB
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

