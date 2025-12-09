"""
PDF Processing Service
Handles PDF text extraction and analysis using PyMuPDF
"""

import os
import tempfile
from typing import Dict, List, Optional
import fitz  # PyMuPDF
from pathlib import Path


class PDFProcessor:
    """Service for processing PDF files"""

    MAX_SIZE = 25 * 1024 * 1024  # 25 MB
    MAX_PAGES = 100

    @staticmethod
    def validate_pdf(file_path: str) -> Dict[str, any]:
        """
        Validate PDF file size and page count
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            Dict with validation result and metadata
        """
        file_size = os.path.getsize(file_path)
        
        if file_size > PDFProcessor.MAX_SIZE:
            return {
                "valid": False,
                "error": f"PDF exceeds maximum size of {PDFProcessor.MAX_SIZE / (1024*1024):.0f} MB",
            }
        
        try:
            doc = fitz.open(file_path)
            page_count = len(doc)
            doc.close()
            
            if page_count > PDFProcessor.MAX_PAGES:
                return {
                    "valid": False,
                    "error": f"PDF exceeds maximum page count of {PDFProcessor.MAX_PAGES}",
                    "page_count": page_count,
                }
            
            return {
                "valid": True,
                "page_count": page_count,
                "file_size": file_size,
            }
        except Exception as e:
            return {
                "valid": False,
                "error": f"Unable to read PDF: {str(e)}",
            }

    @staticmethod
    def extract_text(file_path: str, page_range: Optional[List[int]] = None) -> Dict[str, any]:
        """
        Extract text from PDF file
        
        Args:
            file_path: Path to PDF file
            page_range: Optional list of page numbers to extract (1-indexed)
            
        Returns:
            Dict with extracted text and metadata
        """
        try:
            doc = fitz.open(file_path)
            total_pages = len(doc)
            
            # Determine which pages to extract
            if page_range:
                pages_to_extract = [p - 1 for p in page_range if 1 <= p <= total_pages]  # Convert to 0-indexed
            else:
                pages_to_extract = list(range(total_pages))
            
            # Extract text from each page
            extracted_text = []
            page_texts = {}
            
            for page_num in pages_to_extract:
                page = doc[page_num]
                text = page.get_text()
                extracted_text.append(text)
                page_texts[page_num + 1] = text  # Store as 1-indexed
            
            doc.close()
            
            # Combine all text
            full_text = "\n\n".join(extracted_text)
            
            return {
                "success": True,
                "text": full_text,
                "page_texts": page_texts,
                "total_pages": total_pages,
                "pages_extracted": len(pages_to_extract),
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error extracting text from PDF: {str(e)}",
            }

    @staticmethod
    def extract_text_with_citations(file_path: str) -> Dict[str, any]:
        """
        Extract text with page and section citations
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            Dict with text organized by page and section
        """
        try:
            doc = fitz.open(file_path)
            total_pages = len(doc)
            
            pages_data = []
            
            for page_num in range(total_pages):
                page = doc[page_num]
                text = page.get_text()
                
                # Try to identify sections (look for headings)
                lines = text.split("\n")
                sections = []
                current_section = {"title": "", "content": ""}
                
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    
                    # Simple heuristic: lines in all caps or starting with numbers might be headings
                    if (
                        line.isupper()
                        and len(line) < 100
                        and len(line) > 3
                        or (line[0].isdigit() and "." in line[:10])
                    ):
                        if current_section["content"]:
                            sections.append(current_section)
                        current_section = {"title": line, "content": ""}
                    else:
                        current_section["content"] += line + " "
                
                if current_section["content"]:
                    sections.append(current_section)
                
                pages_data.append({
                    "page_number": page_num + 1,
                    "text": text,
                    "sections": sections if sections else [{"title": "Content", "content": text}],
                })
            
            doc.close()
            
            return {
                "success": True,
                "pages": pages_data,
                "total_pages": total_pages,
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error extracting text with citations: {str(e)}",
            }

    @staticmethod
    def get_pdf_metadata(file_path: str) -> Dict[str, any]:
        """
        Get PDF metadata (title, author, creation date, etc.)
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            Dict with PDF metadata
        """
        try:
            doc = fitz.open(file_path)
            metadata = doc.metadata
            page_count = len(doc)
            doc.close()
            
            return {
                "success": True,
                "metadata": metadata,
                "page_count": page_count,
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error reading PDF metadata: {str(e)}",
            }

