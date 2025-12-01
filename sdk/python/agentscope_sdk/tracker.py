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
