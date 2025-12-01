"""Main AgentScope SDK client."""
import requests
from typing import Optional, Dict, Any
from datetime import datetime
import logging

from .types import RunConfig, StepConfig, RunResponse, JSONDict, RunStatus
from .errors import AuthenticationError, APIError, ConfigurationError


logger = logging.getLogger(__name__)


class AgentScopeClient:
    """Client for interacting with AgentScope API."""
    
    def __init__(
        self,
        api_key: str,
        base_url: str = "http://localhost:8000",
        timeout: int = 30,
        fail_silently: bool = True,
    ):
        """
        Initialize the AgentScope client.
        
        Args:
            api_key: Your AgentScope API key
            base_url: Base URL of the AgentScope API
            timeout: Request timeout in seconds
            fail_silently: If True, log errors but don't raise exceptions
        """
        if not api_key:
            raise ConfigurationError("API key is required")
        
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.fail_silently = fail_silently
        self._session = requests.Session()
        self._session.headers.update({
            "X-Agentscope-Key": api_key,
            "Content-Type": "application/json",
        })
    
    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
    ) -> Optional[Dict[str, Any]]:
        """Make an API request with error handling."""
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self._session.request(
                method=method,
                url=url,
                json=data,
                timeout=self.timeout,
            )
            
            if response.status_code == 401:
                raise AuthenticationError("Invalid API key")
            
            response.raise_for_status()
            return response.json() if response.content else None
            
        except requests.exceptions.RequestException as e:
            error_msg = f"API request failed: {str(e)}"
            logger.error(error_msg)
            
            if self.fail_silently:
                return None
            
            raise APIError(error_msg, getattr(e.response, 'status_code', None))
    
    def create_run(self, config: RunConfig) -> Optional[str]:
        """
        Create a new run.
        
        Args:
            config: Run configuration
            
        Returns:
            Run ID if successful, None if failed (when fail_silently=True)
        """
        data = {
            "agent_name": config.agent_name,
            "external_id": config.external_id,
            "input": config.input,
            "meta_data": config.meta_data,
        }
        
        response = self._make_request("POST", "/api/ingest/run", data)
        return response["id"] if response else None
    
    def add_step(
        self,
        run_id: str,
        config: StepConfig,
    ) -> bool:
        """
        Add a step to a run.
        
        Args:
            run_id: The run ID
            config: Step configuration
            
        Returns:
            True if successful, False otherwise
        """
        data = {
            "step_type": config.step_type,
            "name": config.name,
            "input": config.input,
            "output": config.output,
            "meta_data": config.meta_data,
            "error": config.error,
            "tokens_used": config.tokens_used,
            "latency_ms": config.latency_ms,
            "started_at": config.started_at.isoformat() if config.started_at else None,
            "ended_at": config.ended_at.isoformat() if config.ended_at else None,
        }
        
        response = self._make_request(
            "POST",
            f"/api/ingest/run/{run_id}/step",
            data,
        )
        return response is not None
    
    def complete_run(
        self,
        run_id: str,
        status: RunStatus = "completed",
        output: Optional[JSONDict] = None,
        error: Optional[JSONDict] = None,
    ) -> bool:
        """
        Mark a run as complete.
        
        Args:
            run_id: The run ID
            status: Final status (completed/failed)
            output: Final output
            error: Error details if failed
            
        Returns:
            True if successful, False otherwise
        """
        data = {
            "status": status,
            "output": output,
            "error": error,
            "ended_at": datetime.utcnow().isoformat(),
        }
        
        response = self._make_request(
            "PATCH",
            f"/api/ingest/run/{run_id}",
            data,
        )
        return response is not None
    
    def close(self):
        """Close the HTTP session."""
        self._session.close()
