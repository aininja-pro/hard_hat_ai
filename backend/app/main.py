"""
Hard Hat AI Pack - FastAPI Backend
Main application entry point
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.middleware.cors import get_cors_config
from app.routers import health, site_scribe, file_test, code_commander

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
app.include_router(health.router)
app.include_router(site_scribe.router)
app.include_router(file_test.router)  # Test endpoint for Phase 3
app.include_router(code_commander.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Hard Hat AI Pack API",
        "version": "0.1.0",
        "status": "running"
    }

