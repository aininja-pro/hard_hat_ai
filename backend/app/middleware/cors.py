"""
CORS configuration middleware
"""

import os
from typing import List

def get_cors_config() -> dict:
    """
    Get CORS configuration based on environment variables.
    Defaults to allowing localhost for development.
    """
    # Get allowed origins from environment, default to localhost
    allowed_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:3000")
    allowed_origins: List[str] = [
        origin.strip() for origin in allowed_origins_env.split(",")
    ]
    
    return {
        "allow_origins": allowed_origins,
        "allow_credentials": True,
        "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["*"],
    }

