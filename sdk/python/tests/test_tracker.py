"""Tests for AgentScope tracker."""
import pytest
from unittest.mock import Mock, patch
from agentscope_sdk.tracker import RunTracker, create_tracker
from agentscope_sdk.client import AgentScopeClient


@patch('agentscope_sdk.tracker.AgentScopeClient')
def test_create_tracker(mock_client_class):
    """Test tracker creation."""
    tracker = create_tracker(api_key="test_key")
    assert isinstance(tracker, RunTracker)
    mock_client_class.assert_called_once()


def test_start_run():
    """Test starting a run."""
    mock_client = Mock(spec=AgentScopeClient)
    mock_client.create_run.return_value = "run_123"
    
    tracker = RunTracker(mock_client)
    run_id = tracker.start_run("test_agent", input_data={"query": "test"})
    
    assert run_id == "run_123"
    assert tracker.current_run_id == "run_123"
    mock_client.create_run.assert_called_once()


def test_track_step():
    """Test tracking a step."""
    mock_client = Mock(spec=AgentScopeClient)
    mock_client.add_step.return_value = True
    
    tracker = RunTracker(mock_client)
    tracker.current_run_id = "run_123"
    
    success = tracker.track_step(
        name="test_step",
        step_type="llm_call",
        input_data={"prompt": "test"}
    )
    
    assert success is True
    mock_client.add_step.assert_called_once()


def test_track_step_no_run():
    """Test tracking step without active run."""
    mock_client = Mock(spec=AgentScopeClient)
    tracker = RunTracker(mock_client)
    
    success = tracker.track_step(name="test_step")
    
    assert success is False
    mock_client.add_step.assert_not_called()


def test_end_run():
    """Test ending a run."""
    mock_client = Mock(spec=AgentScopeClient)
    mock_client.complete_run.return_value = True
    
    tracker = RunTracker(mock_client)
    tracker.current_run_id = "run_123"
    
    success = tracker.end_run(status="completed")
    
    assert success is True
    assert tracker.current_run_id is None
    mock_client.complete_run.assert_called_once()


def test_track_run_context_manager():
    """Test track_run context manager."""
    mock_client = Mock(spec=AgentScopeClient)
    mock_client.create_run.return_value = "run_123"
    mock_client.complete_run.return_value = True
    
    tracker = RunTracker(mock_client)
    
    with tracker.track_run("test_agent") as run_id:
        assert run_id == "run_123"
    
    mock_client.create_run.assert_called_once()
    mock_client.complete_run.assert_called_once()


def test_track_run_context_manager_error():
    """Test track_run context manager with error."""
    mock_client = Mock(spec=AgentScopeClient)
    mock_client.create_run.return_value = "run_123"
    mock_client.complete_run.return_value = True
    
    tracker = RunTracker(mock_client)
    
    with pytest.raises(ValueError):
        with tracker.track_run("test_agent"):
            raise ValueError("Test error")
    
    # Should still complete run with failed status
    mock_client.complete_run.assert_called_once()
    call_args = mock_client.complete_run.call_args
    # Check positional arguments: (run_id, status, output, error)
    assert call_args[0][1] == "failed"  # status is second positional arg
    assert call_args[0][3] is not None  # error should be present


def test_track_step_context():
    """Test track_step_context manager."""
    mock_client = Mock(spec=AgentScopeClient)
    mock_client.add_step.return_value = True
    
    tracker = RunTracker(mock_client)
    tracker.current_run_id = "run_123"
    
    with tracker.track_step_context("test_step", step_type="llm_call"):
        pass
    
    mock_client.add_step.assert_called_once()
    # Verify latency_ms was calculated
    call_args = mock_client.add_step.call_args[0][1]
    assert call_args.latency_ms is not None
    assert call_args.latency_ms >= 0
