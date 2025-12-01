from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import (
    auth_router,
    users_router,
    projects_router,
    api_keys_router,
    ingest_router,
    runs_router,
    tests_router,
    breakpoints_router,
    mcp_router
)

# Initialize FastAPI app
app = FastAPI(
    title="AgentScope API",
    description="AI Agent Debugger & Testing Platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(projects_router)
app.include_router(api_keys_router)
app.include_router(ingest_router)
app.include_router(runs_router)
app.include_router(tests_router)
app.include_router(breakpoints_router)
app.include_router(mcp_router)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "agentscope-api"}


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AgentScope API",
        "version": "1.0.0",
        "docs": "/docs"
    }
