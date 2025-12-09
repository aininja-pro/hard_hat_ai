"""
File Validation Middleware
Server-side validation for uploaded files
"""

import os
from typing import Optional, Dict, Any
from fastapi import UploadFile, HTTPException
from app.services.pdf_processor import PDFProcessor


async def validate_uploaded_file(
    file: UploadFile,
    file_type: str = "pdf",
    max_size: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Validate uploaded file on the server side
    
    Args:
        file: FastAPI UploadFile object
        file_type: Type of file ("pdf" or "image")
        max_size: Optional maximum size override
        
    Returns:
        Dict with validation result
        
    Raises:
        HTTPException if validation fails
    """
    # Read file content to check size
    content = await file.read()
    file_size = len(content)
    
    # Reset file pointer
    await file.seek(0)
    
    # Check file size
    if file_type == "pdf":
        max_allowed = max_size or PDFProcessor.MAX_SIZE
        if file_size > max_allowed:
            raise HTTPException(
                status_code=400,
                detail=f"File size ({file_size / (1024*1024):.2f} MB) exceeds maximum ({max_allowed / (1024*1024):.0f} MB)",
            )
        
        # Check file extension
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="File must be a PDF",
            )
    
    elif file_type == "image":
        max_allowed = max_size or (10 * 1024 * 1024)  # 10 MB
        if file_size > max_allowed:
            raise HTTPException(
                status_code=400,
                detail=f"Image size ({file_size / (1024*1024):.2f} MB) exceeds maximum ({max_allowed / (1024*1024):.0f} MB)",
            )
        
        # Check file extension
        allowed_extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
        if not file.filename or not any(
            file.filename.lower().endswith(ext) for ext in allowed_extensions
        ):
            raise HTTPException(
                status_code=400,
                detail=f"Image must be one of: {', '.join(allowed_extensions)}",
            )
    
    # Check for path traversal in filename
    if file.filename:
        if ".." in file.filename or "/" in file.filename or "\\" in file.filename:
            raise HTTPException(
                status_code=400,
                detail="Invalid file name",
            )
    
    return {
        "valid": True,
        "file_size": file_size,
        "filename": file.filename,
    }

