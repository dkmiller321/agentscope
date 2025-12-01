"""Tests for AgentScope client."""
import pytest
from unittest.mock import Mock, patch
from agentscope_sdk.client import AgentScopeClient
from agentscope_sdk.types import RunConfig, StepConfig
from agentscope_sdk.errors import AuthenticationError, APIError, ConfigurationError


def test_client_requires_api_key():
    """Test that client requires an API key."""
    with pytest.raises(ConfigurationError):
        AgentScopeClient(api_key="")


def test_client_initialization():
    """Test client initialization."""
    client = AgentScopeClient(api_key="test_key")
    assert client.api_key == "test_key"
    assert client.base_url == "http://localhost:8000"
    assert client.timeout == 30
    assert client.fail_silently is True


def test_client_custom_config():
    """Test client with custom configuration."""
    client = AgentScopeClient(
        api_key="test_key",
        base_url="https://api.example.com",
        timeout=60,
        fail_silently=False
    )
    assert client.base_url == "https://api.example.com"
    assert client.timeout == 60
    assert client.fail_silently is False


@patch('agentscope_sdk.client.requests.Session')
def test_create_run_success(mock_session_class):
    """Test successful run creation."""
    mock_session = Mock()
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.content = True
    mock_response.json.return_value = {"id": "run_123"}
    mock_session.request.return_value = mock_response
    mock_session_class.return_value = mock_session
    
    client = AgentScopeClient(api_key="test_key")
    config = RunConfig(agent_name="test_agent")
    run_id = client.create_run(config)
    
    assert run_id == "run_123"


@patch('agentscope_sdk.client.requests.Session')
def test_create_run_auth_error(mock_session_class):
    """Test authentication error handling."""
    mock_session = Mock()
    mock_response = Mock()
    mock_response.status_code = 401
    mock_session.request.return_value = mock_response
    mock_session_class.return_value = mock_session
    
    client = AgentScopeClient(api_key="invalid_key", fail_silently=False)
    config = RunConfig(agent_name="test_agent")
    
    with pytest.raises(AuthenticationError):
        client.create_run(config)


@patch('agentscope_sdk.client.requests.Session')
def test_add_step_success(mock_session_class):
    """Test successful step addition."""
    mock_session = Mock()
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.content = True
    mock_response.json.return_value = {"success": True}
    mock_session.request.return_value = mock_response
    mock_session_class.return_value = mock_session
    
    client = AgentScopeClient(api_key="test_key")
    config = StepConfig(name="test_step", step_type="llm_call")
    success = client.add_step("run_123", config)
    
    assert success is True


@patch('agentscope_sdk.client.requests.Session')
def test_complete_run_success(mock_session_class):
    """Test successful run completion."""
    mock_session = Mock()
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.content = True
    mock_response.json.return_value = {"success": True}
    mock_session.request.return_value = mock_response
    mock_session_class.return_value = mock_session
    
    client = AgentScopeClient(api_key="test_key")
    success = client.complete_run("run_123", status="completed")
    
    assert success is True


@patch('agentscope_sdk.client.requests.Session')
def test_fail_silently(mock_session_class):
    """Test fail_silently mode."""
    import requests
    mock_session = Mock()
    mock_session.request.side_effect = requests.exceptions.RequestException("Network error")
    mock_session_class.return_value = mock_session
    
    client = AgentScopeClient(api_key="test_key", fail_silently=True)
    config = RunConfig(agent_name="test_agent")
    run_id = client.create_run(config)
    
    # Should return None instead of raising exception
    assert run_id is None
