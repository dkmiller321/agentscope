from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
import secrets
from ..database import get_db
from ..models import User, Project, ApiKey
from ..schemas import ApiKeyCreate, ApiKeyResponse, ApiKeyCreateResponse, Message
from ..dependencies import get_current_user
from ..services.auth_service import AuthService

router = APIRouter(tags=["api_keys"])


@router.get("/api/projects/{project_id}/api-keys", response_model=list[ApiKeyResponse])
async def list_api_keys(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List API keys for a project"""
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == current_user.id
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")
    
    keys_result = await db.execute(
        select(ApiKey).where(ApiKey.project_id == project_id)
    )
    keys = keys_result.scalars().all()
    return [ApiKeyResponse.from_orm(k) for k in keys]


@router.post("/api/projects/{project_id}/api-keys", response_model=ApiKeyCreateResponse)
async def create_api_key(
    project_id: UUID,
    key_data: ApiKeyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new API key"""
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == current_user.id
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Generate API key
    api_key = f"ask_{secrets.token_urlsafe(32)}"
    key_hash = AuthService.hash_password(api_key)
    key_prefix = api_key[:8]
    
    # Create API key record
    api_key_record = ApiKey(
        project_id=project_id,
        key_hash=key_hash,
        key_prefix=key_prefix,
        name=key_data.name
    )
    db.add(api_key_record)
    await db.commit()
    await db.refresh(api_key_record)
    
    return ApiKeyCreateResponse(
        id=api_key_record.id,
        project_id=api_key_record.project_id,
        key=api_key,
        key_prefix=key_prefix,
        name=api_key_record.name,
        created_at=api_key_record.created_at
    )


@router.delete("/api/projects/{project_id}/api-keys/{key_id}", response_model=Message)
async def revoke_api_key(
    project_id: UUID,
    key_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Revoke an API key"""
    from datetime import datetime
    
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == current_user.id
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")
    
    key_result = await db.execute(
        select(ApiKey).where(
            ApiKey.id == key_id,
            ApiKey.project_id == project_id
        )
    )
    api_key = key_result.scalar_one_or_none()
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    api_key.revoked_at = datetime.utcnow()
    await db.commit()
    
    return Message(message="API key revoked successfully")
