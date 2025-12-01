from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for user registration"""
    email: EmailStr
    password: str
    name: str | None = None


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user response"""
    id: UUID
    email: str
    name: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
