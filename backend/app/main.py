"""
Hard Hat AI Pack - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.middleware.cors import get_cors_config
from app.routers import health

# Initialize FastAPI app
app = FastAPI(
    title="Hard Hat AI Pack API",
    description="Backend API for Hard Hat AI Pack construction management suite",
    version="0.1.0",
)

# Configure CORS
cors_config = get_cors_config()
app.add_middleware(
    CORSMiddleware,
    **cors_config
)

# Include routers
app.include_router(health.router, tags=["health"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Hard Hat AI Pack API",
        "version": "0.1.0",
        "status": "running"
    }

