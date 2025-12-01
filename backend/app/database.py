from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from .config import settings
import ssl

# Parse DATABASE_URL to handle asyncpg SSL configuration
def get_database_url_and_connect_args():
    """
    Parse DATABASE_URL and prepare it for asyncpg.
    asyncpg doesn't accept 'sslmode' parameter, so we need to remove it
    and configure SSL using connect_args instead.
    """
    url = settings.DATABASE_URL
    connect_args = {}
    
    # Check if using asyncpg and has sslmode parameter
    if "postgresql+asyncpg://" in url and "sslmode=" in url:
        # Remove sslmode from URL
        url = url.split("?")[0]
        
        # Configure SSL for asyncpg
        connect_args = {
            "ssl": ssl.create_default_context()
        }
    
    return url, connect_args

# Get cleaned URL and connection arguments
database_url, connect_args = get_database_url_and_connect_args()

# Create async engine
engine = create_async_engine(
    database_url,
    echo=True,
    future=True,
    connect_args=connect_args
)

# Create async session maker
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()


# Dependency to get database session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
