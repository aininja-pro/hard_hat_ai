"""
CORS configuration middleware
"""

import os
from typing import List

def get_cors_config() -> dict:
    """
    Get CORS configuration based on environment variables.
    Defaults to allowing all origins for development.
    """
    # For development, allow all origins
    # In production, set CORS_ORIGINS environment variable
    allowed_origins_env = os.getenv("CORS_ORIGINS", "")

    if allowed_origins_env:
        allowed_origins: List[str] = [
            origin.strip() for origin in allowed_origins_env.split(",")
        ]
        return {
            "allow_origins": allowed_origins,
            "allow_credentials": True,
            "allow_methods": ["*"],
            "allow_headers": ["*"],
        }

    # Development mode: allow all origins
    return {
        "allow_origins": ["*"],
        "allow_credentials": False,  # Cannot use credentials with wildcard origin
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }

