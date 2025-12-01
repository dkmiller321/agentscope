from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from .database import get_db
from .models import User, Project, ApiKey
from .services.auth_service import AuthService
from datetime import datetime

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency to get current authenticated user from JWT token
    """
    token = credentials.credentials
    payload = AuthService.decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


async def get_project_from_api_key(
    x_agentscope_key: str = Header(...),
    db: AsyncSession = Depends(get_db)
) -> Project:
    """
    Dependency to authenticate and get project from API key
    Used for SDK ingestion endpoints
    """
    if not x_agentscope_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required"
        )
    
    # Hash the provided key
    key_hash = AuthService.hash_password(x_agentscope_key)
    
    # Look up the API key
    result = await db.execute(
        select(ApiKey)
        .where(ApiKey.key_hash == key_hash)
        .where(ApiKey.revoked_at.is_(None))
    )
    api_key = result.scalar_one_or_none()
    
    if api_key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API key"
        )
    
    # Update last_used_at
    api_key.last_used_at = datetime.utcnow()
    await db.commit()
    
    # Get and return the associated project
    result = await db.execute(
        select(Project).where(Project.id == api_key.project_id)
    )
    project = result.scalar_one_or_none()
    
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project
