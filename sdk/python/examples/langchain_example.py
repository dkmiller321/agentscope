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
