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
