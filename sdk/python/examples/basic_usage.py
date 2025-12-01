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
