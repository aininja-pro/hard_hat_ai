"""
File Processing Test Endpoint
For testing Phase 3 file processing infrastructure
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from app.middleware.file_validation import validate_uploaded_file
from app.services.pdf_processor import PDFProcessor
from app.utils.file_cleanup import TemporaryFile
import os

router = APIRouter(prefix="/api/test/file", tags=["file-test"])


@router.post("/upload-pdf")
async def test_pdf_upload(file: UploadFile = File(...)):
    """
    Test endpoint for PDF upload and processing
    """
    temp_file_path = None
    
    try:
        # Validate file
        validation = await validate_uploaded_file(file, file_type="pdf")
        
        # Save to temporary file
        with TemporaryFile(prefix="test_pdf_", suffix=".pdf") as temp_path:
            temp_file_path = temp_path
            
            # Write uploaded content to temp file
            content = await file.read()
            with open(temp_path, "wb") as f:
                f.write(content)
            
            # Validate PDF structure
            pdf_validation = PDFProcessor.validate_pdf(temp_path)
            if not pdf_validation.get("valid"):
                raise HTTPException(status_code=400, detail=pdf_validation.get("error"))
            
            # Extract text (first page only for testing)
            extraction_result = PDFProcessor.extract_text(temp_path, page_range=[1])
            
            # Get metadata
            metadata_result = PDFProcessor.get_pdf_metadata(temp_path)
            
            return JSONResponse({
                "success": True,
                "validation": validation,
                "pdf_validation": pdf_validation,
                "extraction": {
                    "success": extraction_result.get("success"),
                    "text_preview": extraction_result.get("text", "")[:500] + "..." if extraction_result.get("text") else None,
                    "total_pages": extraction_result.get("total_pages"),
                },
                "metadata": metadata_result.get("metadata", {}) if metadata_result.get("success") else None,
                "message": "File processed successfully and will be cleaned up automatically",
            })
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    finally:
        # Cleanup is handled by TemporaryFile context manager
        pass


@router.post("/upload-image")
async def test_image_upload(file: UploadFile = File(...)):
    """
    Test endpoint for image upload and validation
    """
    try:
        # Validate file
        validation = await validate_uploaded_file(file, file_type="image")
        
        # Read file info
        content = await file.read()
        file_size = len(content)
        
        return JSONResponse({
            "success": True,
            "validation": validation,
            "file_size": file_size,
            "file_size_mb": round(file_size / (1024 * 1024), 2),
            "message": "Image validated successfully",
        })
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

