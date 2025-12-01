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

## Usage Examples

### Basic Usage

```python
from agentscope_sdk import create_tracker

tracker = create_tracker(api_key="your_api_key")

# Start a run
run_id = tracker.start_run(
    agent_name="my_agent",
    input_data={"query": "What is the weather?"}
)

# Track steps
tracker.track_step(
    name="fetch_weather",
    step_type="tool_call",
    input_data={"location": "San Francisco"},
    output_data={"temperature": 65},
    latency_ms=150
)

# End the run
tracker.end_run(status="completed")
```

### Context Manager

```python
from agentscope_sdk import create_tracker

tracker = create_tracker(api_key="your_api_key")

# Automatic run management
with tracker.track_run("my_agent", input_data={"query": "Hello"}):
    # Your agent code here
    tracker.track_step("step1", step_type="llm_call")
    tracker.track_step("step2", step_type="tool_call")
# Run automatically completes when context exits
```

### LangChain Integration

```python
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage
from agentscope_sdk import create_tracker
import time

tracker = create_tracker(api_key="your_api_key")
llm = ChatOpenAI()

def run_agent(query: str):
    with tracker.track_run("langchain_agent", input_data={"query": query}):
        start = time.time()
        response = llm([HumanMessage(content=query)])
        latency = int((time.time() - start) * 1000)
        
        tracker.track_step(
            name="llm_call",
            step_type="llm_call",
            input_data={"query": query},
            output_data={"response": response.content},
            latency_ms=latency
        )
        
        return response.content
```

## API Reference

### `create_tracker(api_key, base_url="http://localhost:8000", **kwargs)`

Create a new tracker instance.

**Parameters:**
- `api_key` (str): Your AgentScope API key
- `base_url` (str): Base URL of the AgentScope API (default: "http://localhost:8000")
- `timeout` (int): Request timeout in seconds (default: 30)
- `fail_silently` (bool): If True, log errors but don't raise exceptions (default: True)

**Returns:** `RunTracker` instance

### `RunTracker.start_run(agent_name, input_data=None, external_id=None, meta_data=None)`

Start a new run.

**Parameters:**
- `agent_name` (str): Name of the agent
- `input_data` (dict, optional): Input data for the run
- `external_id` (str, optional): Your own tracking ID
- `meta_data` (dict, optional): Additional metadata

**Returns:** Run ID (str) or None

### `RunTracker.track_step(name, step_type="other", ...)`

Track a step in the current run.

**Parameters:**
- `name` (str): Step name
- `step_type` (str): Type of step ("llm_call", "tool_call", "reasoning", "other")
- `input_data` (dict, optional): Step input
- `output_data` (dict, optional): Step output
- `error` (dict, optional): Error details if step failed
- `tokens_used` (int, optional): Tokens consumed
- `latency_ms` (int, optional): Step latency in milliseconds
- `meta_data` (dict, optional): Additional metadata
- `run_id` (str, optional): Run ID (uses current_run_id if not specified)

**Returns:** True if successful, False otherwise

### `RunTracker.end_run(status="completed", output=None, error=None, run_id=None)`

End the current run.

**Parameters:**
- `status` (str): Final status ("completed" or "failed")
- `output` (dict, optional): Final output
- `error` (dict, optional): Error details if failed
- `run_id` (str, optional): Run ID (uses current_run_id if not specified)

**Returns:** True if successful, False otherwise

### Context Managers

#### `RunTracker.track_run(agent_name, input_data=None, **kwargs)`

Context manager for tracking a complete run with automatic completion.

```python
with tracker.track_run("my_agent") as run_id:
    # Your code here
    pass
# Run automatically completes
```

#### `RunTracker.track_step_context(name, step_type="other", input_data=None, **kwargs)`

Context manager for tracking a step with automatic timing.

```python
with tracker.track_step_context("llm_call", input_data={...}):
    # Your LLM call here
    result = llm.generate(...)
# Step automatically tracked with latency
```

## Error Handling

The SDK is fail-safe by default. If `fail_silently=True` (default), API errors are logged but won't break your agent:

```python
tracker = create_tracker(api_key="invalid_key", fail_silently=True)
run_id = tracker.start_run("my_agent")  # Returns None on error, doesn't crash
```

Set `fail_silently=False` to raise exceptions on errors:

```python
tracker = create_tracker(api_key="invalid_key", fail_silently=False)
try:
    run_id = tracker.start_run("my_agent")
except AuthenticationError as e:
    print(f"Invalid API key: {e}")
```

## Step Types

The SDK supports the following step types:

- `"llm_call"`: LLM/model inference calls
- `"tool_call"`: External tool or API calls
- `"reasoning"`: Agent reasoning or planning steps
- `"other"`: Any other type of step

## Getting an API Key

1. Sign up at [AgentScope](https://agentscope.dev)
2. Create a project
3. Navigate to API Keys section
4. Generate a new API key

## Development

Install development dependencies:

```bash
pip install -e ".[dev]"
```

Run tests:

```bash
pytest
```

Format code:

```bash
black .
ruff check .
```

## License

MIT

## Support

- Documentation: https://docs.agentscope.dev
- Issues: https://github.com/yourusername/agentscope/issues
- Email: support@agentscope.dev

## Contributing

Contributions are welcome! Please see our contributing guidelines.
