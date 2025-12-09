"""
Pydantic models for Lookahead Builder API requests and responses
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class ImageAnalysis(BaseModel):
    """Image analysis results"""
    space_type: str = Field(..., description="Type of space identified")
    estimated_dimensions: str = Field(..., description="Estimated dimensions")
    current_phase: str = Field(..., description="Current construction phase")
    visible_conditions: List[str] = Field(default_factory=list, description="Visible conditions observed")
    trades_identified: List[str] = Field(default_factory=list, description="Trades identified")


class ScheduleItem(BaseModel):
    """Individual schedule item"""
    day: int = Field(..., description="Day number (1-14)")
    date: str = Field(..., description="Date string (e.g., 'Mon 12/16')")
    task: str = Field(..., description="Task description")
    trade: str = Field(..., description="Trade name")
    crew_size: int = Field(..., description="Number of workers")
    duration_hours: int = Field(..., description="Duration in hours")
    materials: str = Field(..., description="Materials needed")
    notes: str = Field(default="", description="Additional notes")


class LookaheadBuilderResponse(BaseModel):
    """Response model for Lookahead Builder"""
    image_analysis: Optional[ImageAnalysis] = Field(None, description="Image analysis (if image provided)")
    schedule: List[ScheduleItem] = Field(..., description="2-week schedule items")
    assumptions: List[str] = Field(default_factory=list, description="Assumptions made")
    verify_with_foreman: List[str] = Field(default_factory=list, description="Questions to verify")
    confidence_level: str = Field(..., description="Confidence level: High, Medium, or Low")
    confidence_explanation: str = Field(..., description="Explanation of confidence level")
    warnings: List[str] = Field(default_factory=list, description="Any warnings")

