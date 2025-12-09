"""
Pydantic models for Submittal Scrubber API requests and responses
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class ComplianceItem(BaseModel):
    """Individual compliance check result"""
    requirement: str = Field(..., description="The requirement from the spec")
    spec_text: str = Field(..., description="Relevant text from the specification document")
    product_text: str = Field(..., description="Relevant text from the product data document")
    status: str = Field(..., description="Compliance status: pass, warn, or fail")
    notes: Optional[str] = Field(None, description="Additional notes or explanation")


class SubmittalScrubberResponse(BaseModel):
    """Response model for Submittal Scrubber"""
    compliance_items: List[ComplianceItem] = Field(..., description="List of compliance check results")
    summary: str = Field(..., description="Overall compliance summary")
    confidence: str = Field(..., description="Confidence level: High, Med, or Low")

