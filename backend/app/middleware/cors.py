"""
CORS configuration middleware
"""

import os
from typing import List

def get_cors_config() -> dict:
    """
    Get CORS configuration based on environment variables.
    Defaults to allowing localhost and common local IP addresses for development.
    """
    # Get allowed origins from environment, default to localhost and common local IPs
    default_origins = "http://localhost:3000,http://127.0.0.1:3000,http://192.168.1.81:3000"
    allowed_origins_env = os.getenv("CORS_ORIGINS", default_origins)
    allowed_origins: List[str] = [
        origin.strip() for origin in allowed_origins_env.split(",")
    ]
    
    return {
        "allow_origins": allowed_origins,
        "allow_credentials": True,
        "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["*"],
    }

