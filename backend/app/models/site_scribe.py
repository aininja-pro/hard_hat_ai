"""
Pydantic models for Site Scribe API requests and responses
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Literal, Optional


class SiteScribeRequest(BaseModel):
    """Request model for Site Scribe transformation"""
    text: str = Field(..., description="The raw field notes or text to transform")
    tone: Literal["neutral", "firm", "cya"] = Field(
        default="neutral",
        description="Tone for the email: neutral, firm, or cya (cover your ass)"
    )
    to_email: Optional[str] = Field(None, description="Recipient email address")
    to_name: Optional[str] = Field(None, description="Recipient name")
    from_email: Optional[str] = Field(None, description="Sender email address")
    from_name: Optional[str] = Field(None, description="Sender name")
    subject: Optional[str] = Field(None, description="Email subject line (optional, AI will generate if not provided)")
    cc: Optional[str] = Field(None, description="CC email addresses (comma-separated)")
    bcc: Optional[str] = Field(None, description="BCC email addresses (comma-separated)")


class SiteScribeResponse(BaseModel):
    """Response model for Site Scribe"""
    email: str = Field(..., description="The generated professional email")
    confidence: Literal["High", "Med", "Low"] = Field(
        ..., description="Confidence level of the AI response"
    )

