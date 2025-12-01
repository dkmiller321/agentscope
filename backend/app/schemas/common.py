from pydantic import BaseModel
from typing import TypeVar, Generic, List

T = TypeVar('T')


class Message(BaseModel):
    """Generic message response"""
    message: str


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response"""
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
