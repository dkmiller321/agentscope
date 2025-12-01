"""Custom exceptions for AgentScope SDK."""
from typing import Optional


class AgentScopeError(Exception):
    """Base exception for AgentScope SDK."""
    pass


class AuthenticationError(AgentScopeError):
    """Raised when API key is invalid."""
    pass


class APIError(AgentScopeError):
    """Raised when API returns an error."""
    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code


class ConfigurationError(AgentScopeError):
    """Raised when SDK is misconfigured."""
    pass
