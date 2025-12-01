# AgentScope Python SDK Creation Build Prompt

## Context

AgentScope is a full-stack AI agent debugging and testing platform. The backend API is complete, and the frontend is either complete or will be completed using `FRONTEND_COMPLETION_PROMPT.md`. Now we need to create a Python SDK that makes it easy for developers to instrument their AI agents and send execution data to AgentScope.

## Goal

Create a lightweight, easy-to-use Python SDK that:
1. Wraps the AgentScope ingestion API
2. Provides a simple interface for tracking agent runs and steps
3. Handles API authentication automatically
4. Supports context managers for clean code
5. Is production-ready with proper error handling
6. Works with popular AI frameworks (LangChain, AutoGPT, etc.)

## SDK Design Principles

1. **Simple API**: Most common use cases should be 1-2 lines of code
2. **Non-invasive**: Minimal changes to existing agent code
3. **Fail-safe**: SDK errors should never break the agent
4. **Type-safe**: Full type hints for IDE autocomplete
5. **Async-aware**: Support both sync and async code
6. **Zero dependencies**: Only use Python standard library (except `requests`)

## Implementation Plan

### Phase 1: Core SDK Structure

#### 1.1 Project Structure

Create a new directory: `sdk/python/`

```
sdk/python/
├── agentscope_sdk/
│   ├── __init__.py
│   ├── client.py          # Main SDK client
│   ├── tracker.py         # Run/step tracking
│   ├── types.py           # Type definitions
│   ├── errors.py          # Custom exceptions
│   └── async_client.py    # Async version
├── examples/
│   ├── basic_usage.py
│   ├── langchain_example.py
│   ├── context_manager.py
│   └── async_example.py
├── tests/
│   ├── test_client.py
│   ├── test_tracker.py
│   └── test_integration.py
├── setup.py
├── pyproject.toml
├── README.md
└── LICENSE
```

#### 1.2 Package Metadata

**File:** `sdk/python/pyproject.toml`

```toml
[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "agentscope-sdk"
version = "0.1.0"
description = "Official Python SDK for AgentScope - AI Agent Debugging Platform"
readme = "README.md"
requires-python = ">=3.8"
license = {text = "MIT"}
authors = [
    {name = "AgentScope Team"}
]
keywords = ["ai", "agents", "debugging", "testing", "llm"]
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.8",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
]
dependencies = [
    "requests>=2.25.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-asyncio>=0.21.0",
    "black>=22.0.0",
    "mypy>=1.0.0",
    "ruff>=0.1.0",
]
async = [
    "httpx>=0.24.0",
]

[project.urls]
Homepage = "https://github.com/yourusername/agentscope"
Documentation = "https://docs.agentscope.dev"
Repository = "https://github.com/yourusername/agentscope"
Issues = "https://github.com/yourusername/agentscope/issues"
```

### Phase 2: Core Client Implementation

#### 2.1 Type Definitions

**File:** `sdk/python/agentscope_sdk/types.py`

```python
"""Type definitions for AgentScope SDK."""
from typing import Any, Dict, Optional, Literal
from datetime import datetime
from dataclasses import dataclass

# Type aliases
JSONDict = Dict[str, Any]
StepType = Literal["llm_call", "tool_call", "reasoning", "other"]
RunStatus = Literal["running", "completed", "failed"]


@dataclass
class RunConfig:
    """Configuration for a run."""
    external_id: Optional[str] = None
    agent_name: str = "unknown"
    input: Optional[JSONDict] = None
    meta_data: Optional[JSONDict] = None


@dataclass
class StepConfig:
    """Configuration for a step."""
    step_type: StepType = "other"
    name: str = "step"
    input: Optional[JSONDict] = None
    output: Optional[JSONDict] = None
    meta_data: Optional[JSONDict] = None
    error: Optional[JSONDict] = None
    tokens_used: Optional[int] = None
    latency_ms: Optional[int] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None


@dataclass
class RunResponse:
    """Response from creating a run."""
    id: str
    project_id: str
    external_id: Optional[str]
    agent_name: str
    status: str
    started_at: datetime
    created_at: datetime
```

#### 2.2 Custom Exceptions

**File:** `sdk/python/agentscope_sdk/errors.py`

```python
"""Custom exceptions for AgentScope SDK."""


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
```

#### 2.3 Main Client

**File:** `sdk/python/agentscope_sdk/client.py`

```python
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
```

#### 2.4 Run Tracker (High-Level Interface)

**File:** `sdk/python/agentscope_sdk/tracker.py`

```python
"""High-level run tracking interface."""
from typing import Optional, Dict, Any, Callable
from datetime import datetime
from contextlib import contextmanager
import time
import logging

from .client import AgentScopeClient
from .types import RunConfig, StepConfig, JSONDict, StepType, RunStatus
from .errors import ConfigurationError


logger = logging.getLogger(__name__)


class RunTracker:
    """High-level interface for tracking agent runs."""
    
    def __init__(self, client: AgentScopeClient):
        """
        Initialize the run tracker.
        
        Args:
            client: AgentScope client instance
        """
        self.client = client
        self.current_run_id: Optional[str] = None
    
    def start_run(
        self,
        agent_name: str,
        input_data: Optional[JSONDict] = None,
        external_id: Optional[str] = None,
        meta_data: Optional[JSONDict] = None,
    ) -> Optional[str]:
        """
        Start a new run.
        
        Args:
            agent_name: Name of the agent
            input_data: Input data for the run
            external_id: Your own tracking ID
            meta_data: Additional metadata
            
        Returns:
            Run ID if successful
        """
        config = RunConfig(
            agent_name=agent_name,
            input=input_data,
            external_id=external_id,
            meta_data=meta_data,
        )
        
        run_id = self.client.create_run(config)
        if run_id:
            self.current_run_id = run_id
            logger.info(f"Started run: {run_id}")
        
        return run_id
    
    def track_step(
        self,
        name: str,
        step_type: StepType = "other",
        input_data: Optional[JSONDict] = None,
        output_data: Optional[JSONDict] = None,
        error: Optional[JSONDict] = None,
        tokens_used: Optional[int] = None,
        latency_ms: Optional[int] = None,
        meta_data: Optional[JSONDict] = None,
        run_id: Optional[str] = None,
    ) -> bool:
        """
        Track a step in the current run.
        
        Args:
            name: Step name
            step_type: Type of step (llm_call, tool_call, etc.)
            input_data: Step input
            output_data: Step output
            error: Error details if step failed
            tokens_used: Tokens consumed
            latency_ms: Step latency in milliseconds
            meta_data: Additional metadata
            run_id: Run ID (uses current_run_id if not specified)
            
        Returns:
            True if successful
        """
        target_run_id = run_id or self.current_run_id
        if not target_run_id:
            logger.warning("No active run. Call start_run() first.")
            return False
        
        config = StepConfig(
            name=name,
            step_type=step_type,
            input=input_data,
            output=output_data,
            error=error,
            tokens_used=tokens_used,
            latency_ms=latency_ms,
            meta_data=meta_data,
        )
        
        return self.client.add_step(target_run_id, config)
    
    def end_run(
        self,
        status: RunStatus = "completed",
        output: Optional[JSONDict] = None,
        error: Optional[JSONDict] = None,
        run_id: Optional[str] = None,
    ) -> bool:
        """
        End the current run.
        
        Args:
            status: Final status
            output: Final output
            error: Error details if failed
            run_id: Run ID (uses current_run_id if not specified)
            
        Returns:
            True if successful
        """
        target_run_id = run_id or self.current_run_id
        if not target_run_id:
            logger.warning("No active run to end.")
            return False
        
        success = self.client.complete_run(target_run_id, status, output, error)
        
        if success and target_run_id == self.current_run_id:
            self.current_run_id = None
            logger.info(f"Ended run: {target_run_id}")
        
        return success
    
    @contextmanager
    def track_run(
        self,
        agent_name: str,
        input_data: Optional[JSONDict] = None,
        **kwargs,
    ):
        """
        Context manager for tracking a complete run.
        
        Usage:
            with tracker.track_run("my_agent", input_data={"query": "..."}) as run_id:
                # Your agent code here
                tracker.track_step("step1", ...)
        
        Args:
            agent_name: Name of the agent
            input_data: Input data
            **kwargs: Additional arguments for start_run
            
        Yields:
            Run ID
        """
        run_id = self.start_run(agent_name, input_data, **kwargs)
        
        try:
            yield run_id
            if run_id:
                self.end_run(status="completed", run_id=run_id)
        except Exception as e:
            logger.error(f"Run failed with error: {e}")
            if run_id:
                self.end_run(
                    status="failed",
                    error={"message": str(e), "type": type(e).__name__},
                    run_id=run_id,
                )
            raise
    
    @contextmanager
    def track_step_context(
        self,
        name: str,
        step_type: StepType = "other",
        input_data: Optional[JSONDict] = None,
        **kwargs,
    ):
        """
        Context manager for tracking a step with automatic timing.
        
        Usage:
            with tracker.track_step_context("llm_call", input_data={...}):
                # Call your LLM
                result = llm.generate(...)
        
        Args:
            name: Step name
            step_type: Type of step
            input_data: Input data
            **kwargs: Additional arguments for track_step
        """
        start_time = time.time()
        error_data = None
        output_data = kwargs.pop("output_data", None)
        
        try:
            yield
        except Exception as e:
            error_data = {"message": str(e), "type": type(e).__name__}
            raise
        finally:
            latency_ms = int((time.time() - start_time) * 1000)
            self.track_step(
                name=name,
                step_type=step_type,
                input_data=input_data,
                output_data=output_data,
                error=error_data,
                latency_ms=latency_ms,
                **kwargs,
            )


# Convenience function
def create_tracker(
    api_key: str,
    base_url: str = "http://localhost:8000",
    **kwargs,
) -> RunTracker:
    """
    Create a new RunTracker instance.
    
    Args:
        api_key: Your AgentScope API key
        base_url: Base URL of the AgentScope API
        **kwargs: Additional arguments for AgentScopeClient
        
    Returns:
        RunTracker instance
    """
    client = AgentScopeClient(api_key, base_url, **kwargs)
    return RunTracker(client)
```

#### 2.5 Package Init

**File:** `sdk/python/agentscope_sdk/__init__.py`

```python
"""AgentScope Python SDK."""
from .client import AgentScopeClient
from .tracker import RunTracker, create_tracker
from .types import RunConfig, StepConfig, StepType, RunStatus
from .errors import AgentScopeError, AuthenticationError, APIError, ConfigurationError

__version__ = "0.1.0"
__all__ = [
    "AgentScopeClient",
    "RunTracker",
    "create_tracker",
    "RunConfig",
    "StepConfig",
    "StepType",
    "RunStatus",
    "AgentScopeError",
    "AuthenticationError",
    "APIError",
    "ConfigurationError",
]
```

### Phase 3: Usage Examples

#### 3.1 Basic Usage Example

**File:** `sdk/python/examples/basic_usage.py`

```python
"""Basic usage example for AgentScope SDK."""
from agentscope_sdk import create_tracker

# Initialize tracker
tracker = create_tracker(
    api_key="ask_your_api_key_here",
    base_url="http://localhost:8000"
)

# Start a run
run_id = tracker.start_run(
    agent_name="my_agent",
    input_data={"query": "What is the weather in SF?"}
)

# Track steps
tracker.track_step(
    name="search_weather",
    step_type="tool_call",
    input_data={"location": "San Francisco"},
    output_data={"temperature": 65, "condition": "sunny"},
    tokens_used=0,
    latency_ms=150
)

tracker.track_step(
    name="llm_generate_response",
    step_type="llm_call",
    input_data={"context": "Temperature is 65F, sunny"},
    output_data={"response": "It's 65°F and sunny in San Francisco!"},
    tokens_used=50,
    latency_ms=500
)

# End the run
tracker.end_run(
    status="completed",
    output={"response": "It's 65°F and sunny in San Francisco!"}
)
```

#### 3.2 Context Manager Example

**File:** `sdk/python/examples/context_manager.py`

```python
"""Context manager usage example."""
from agentscope_sdk import create_tracker

tracker = create_tracker(api_key="ask_your_api_key_here")

# Using context manager for automatic run management
with tracker.track_run("my_agent", input_data={"query": "Hello"}) as run_id:
    print(f"Run ID: {run_id}")
    
    # Track a step with automatic timing
    with tracker.track_step_context("llm_call", input_data={"prompt": "..."}):
        # Your LLM call here
        result = "AI response"
    
    # Track another step
    tracker.track_step(
        name="final_step",
        step_type="other",
        output_data={"result": result}
    )
# Run automatically ends when context exits
```

#### 3.3 LangChain Integration Example

**File:** `sdk/python/examples/langchain_example.py`

```python
"""Example of integrating AgentScope with LangChain."""
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage
from agentscope_sdk import create_tracker
import time

# Initialize
tracker = create_tracker(api_key="ask_your_api_key_here")
llm = ChatOpenAI(temperature=0.7)

# Your agent logic
def run_langchain_agent(query: str):
    with tracker.track_run("langchain_agent", input_data={"query": query}):
        # Step 1: Call LLM
        start = time.time()
        response = llm([HumanMessage(content=query)])
        latency = int((time.time() - start) * 1000)
        
        tracker.track_step(
            name="llm_call",
            step_type="llm_call",
            input_data={"query": query},
            output_data={"response": response.content},
            latency_ms=latency,
            tokens_used=response.response_metadata.get("token_usage", {}).get("total_tokens")
        )
        
        return response.content

# Run the agent
result = run_langchain_agent("What is the capital of France?")
print(result)
```

### Phase 4: SDK Documentation

**File:** `sdk/python/README.md`

```markdown
# AgentScope Python SDK

Official Python SDK for [AgentScope](https://agentscope.dev) - The AI Agent Debugging & Testing Platform.

## Installation

```bash
pip install agentscope-sdk
```

## Quick Start

```python
from agentscope_sdk import create_tracker

# Initialize
tracker = create_tracker(
    api_key="ask_your_api_key_here",
    base_url="http://localhost:8000"
)

# Track a run
with tracker.track_run("my_agent", input_data={"query": "Hello"}):
    tracker.track_step(
        name="llm_call",
        step_type="llm_call",
        input_data={"prompt": "..."},
        output_data={"response": "..."}
    )
```

## Features

- ✅ Simple, intuitive API
- ✅ Context managers for automatic tracking
- ✅ Full type hints
- ✅ Fail-safe by default (won't break your agent)
- ✅ Zero dependencies (except requests)
- ✅ Works with any AI framework

## Documentation

See the [full documentation](https://docs.agentscope.dev/sdk/python).

## License

MIT
```

## Testing Strategy

Create comprehensive tests:

1. **Unit Tests**: Test each method in isolation
2. **Integration Tests**: Test against a real AgentScope instance
3. **Examples Tests**: Ensure all examples run successfully

## Success Criteria

The SDK should:
1. ✅ Install with `pip install agentscope-sdk`
2. ✅ Work with 3 lines of code for basic usage
3. ✅ Have 95%+ test coverage
4. ✅ Handle errors gracefully
5. ✅ Support both sync and async code
6. ✅ Work with LangChain, AutoGPT, and custom agents

## Next Steps

After SDK implementation:
1. Publish to PyPI
2. Create JavaScript/TypeScript SDK
3. Write integration guides for popular frameworks
4. Create video tutorials
5. Build example agents

## Notes for Implementation

- Keep it simple - the SDK should be dead simple to use
- Fail gracefully - never break the user's agent
- Log everything - make debugging easy
- Type everything - full IDE support
- Document everything - clear docstrings
- Test everything - comprehensive test suite
