from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import User, Project
from ..schemas import UserCreate, UserLogin, UserResponse, TokenResponse, Message
from ..services.auth_service import AuthService
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user and create a default project"""
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = User(
        email=user_data.email,
        password_hash=AuthService.hash_password(user_data.password),
        name=user_data.name
    )
    db.add(user)
    await db.flush()
    
    # Create default project
    project = Project(
        user_id=user.id,
        name="Default Project",
        description="Your first project"
    )
    db.add(project)
    await db.commit()
    await db.refresh(user)
    
    # Generate token
    token = AuthService.create_access_token({"user_id": str(user.id)})
    
    return TokenResponse(
        access_token=token,
        user=UserResponse.from_orm(user)
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """Login and get JWT token"""
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not AuthService.verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    token = AuthService.create_access_token({"user_id": str(user.id)})
    
    return TokenResponse(
        access_token=token,
        user=UserResponse.from_orm(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current authenticated user"""
    return UserResponse.from_orm(current_user)


@router.post("/logout", response_model=Message)
async def logout():
    """Logout (token invalidation handled client-side)"""
    return Message(message="Successfully logged out")
