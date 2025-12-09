"""
Pydantic models for Code & Spec Commander API requests and responses
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class CodeCommanderRequest(BaseModel):
    """Request model for Code & Spec Commander query"""
    question: str = Field(..., description="The question to ask about the document")
    # PDF file will be uploaded separately via multipart/form-data


class Citation(BaseModel):
    """Citation model for page/section references"""
    page: int = Field(..., description="Page number where the information was found")
    section: Optional[str] = Field(None, description="Section or heading where information was found")
    text: Optional[str] = Field(None, description="Relevant text excerpt from the citation")


class CodeCommanderResponse(BaseModel):
    """Response model for Code & Spec Commander"""
    answer: str = Field(..., description="The answer to the question")
    citations: List[Citation] = Field(default_factory=list, description="Page and section citations")
    confidence: str = Field(..., description="Confidence level: High, Med, or Low")
    found_in_document: bool = Field(True, description="Whether the answer was found in the document")

