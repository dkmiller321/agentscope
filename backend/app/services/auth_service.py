from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from ..config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Service for authentication operations"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def create_access_token(data: dict) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.JWT_SECRET, 
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt
    
    @staticmethod
    def decode_access_token(token: str) -> dict | None:
        """Decode and verify a JWT access token"""
        try:
            payload = jwt.decode(
                token, 
                settings.JWT_SECRET, 
                algorithms=[settings.JWT_ALGORITHM]
            )
            return payload
        except JWTError:
            return None
