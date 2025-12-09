"""
Pydantic models for Contract Hawk API requests and responses
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class RiskItem(BaseModel):
    """Individual risk item in the analysis"""
    clause: str = Field(..., description="The contract clause or section")
    severity: int = Field(..., ge=1, le=5, description="Risk severity level (1-5)")
    contract_language: Optional[str] = Field(None, description="Actual quoted contract language")
    explanation: str = Field(..., description="Plain English explanation of the risk")


class ContractHawkResponse(BaseModel):
    """Response model for Contract Hawk"""
    overall_risk_level: Optional[str] = Field(None, description="Overall risk level: LOW, MODERATE, HIGH, or CRITICAL")
    risks: List[RiskItem] = Field(..., description="List of identified risks")
    summary: str = Field(..., description="Overall summary of contract risks")
    confidence: str = Field(..., description="Confidence level: High, Med, or Low")

