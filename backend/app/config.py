from pydantic_settings import BaseSettings
import json


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    CORS_ORIGINS: str = '["http://localhost:5173"]'
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS from JSON string to list"""
        try:
            return json.loads(self.CORS_ORIGINS)
        except json.JSONDecodeError:
            return ["http://localhost:5173"]
    
    class Config:
        env_file = ".env"


settings = Settings()
