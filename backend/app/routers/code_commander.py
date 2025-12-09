"""
Code & Spec Commander Router
API endpoint for querying technical documents with citations
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
from app.middleware.file_validation import validate_uploaded_file
from app.services.pdf_processor import PDFProcessor
from app.services.claude_client import ClaudeClient
from app.utils.file_cleanup import TemporaryFile
from app.models.code_commander import Citation
import json
import re

router = APIRouter(prefix="/api/code-commander", tags=["code-commander"])
claude_client = ClaudeClient()


def extract_citations_from_response(response_text: str, pdf_pages: dict, question: str) -> list[Citation]:
    """
    Extract citations from Claude's response with better text snippets
    Looks for page references and extracts relevant text excerpts
    
    Args:
        response_text: Claude's response text
        pdf_pages: Dict of page_number -> page_text from PDF
        question: The original question (for context)
        
    Returns:
        List of Citation objects with relevant text snippets
    """
    citations = []
    
    # Look for page references in the response (e.g., "page 5", "p. 10", "on page 3")
    page_patterns = [
        r'page\s+(\d+)',
        r'p\.\s*(\d+)',
        r'p\s+(\d+)',
        r'on\s+page\s+(\d+)',
        r'pages?\s+(\d+)',
    ]
    
    found_pages = set()
    page_contexts = {}  # Store context around where page was mentioned
    
    for pattern in page_patterns:
        matches = re.finditer(pattern, response_text, re.IGNORECASE)
        for match in matches:
            page_num = int(match.group(1))
            if 1 <= page_num <= len(pdf_pages):
                found_pages.add(page_num)
                # Get context around the mention (50 chars before and after)
                start = max(0, match.start() - 50)
                end = min(len(response_text), match.end() + 50)
                page_contexts[page_num] = response_text[start:end]
    
    # Extract relevant snippets from each page
    question_keywords = set(word.lower() for word in question.split() if len(word) > 3)
    
    for page_num in sorted(found_pages):
        page_text = pdf_pages.get(page_num, "")
        
        # Try to find relevant snippet based on question keywords
        best_snippet = None
        best_score = 0
        
        # Split page into sentences
        sentences = re.split(r'[.!?]\s+', page_text)
        
        for sentence in sentences:
            sentence_lower = sentence.lower()
            # Score based on keyword matches
            score = sum(1 for keyword in question_keywords if keyword in sentence_lower)
            
            if score > best_score and len(sentence.strip()) > 20:
                best_score = score
                best_snippet = sentence.strip()
        
        # Fallback to first meaningful sentence or excerpt
        if not best_snippet:
            # Get first non-empty sentence
            for sentence in sentences:
                if len(sentence.strip()) > 20:
                    best_snippet = sentence.strip()
                    break
        
        # If still no snippet, get first 300 chars
        if not best_snippet:
            best_snippet = page_text[:300].strip()
            if len(page_text) > 300:
                best_snippet += "..."
        
        # Try to detect section/heading (look for lines in all caps or numbered)
        section = None
        lines = page_text.split('\n')
        for line in lines[:10]:  # Check first 10 lines
            line_stripped = line.strip()
            if (line_stripped.isupper() and 5 < len(line_stripped) < 100) or \
               (line_stripped and line_stripped[0].isdigit() and '.' in line_stripped[:10]):
                section = line_stripped
                break
        
        citations.append(Citation(
            page=page_num,
            section=section,
            text=best_snippet[:500]  # Limit to 500 chars
        ))
    
    return citations


def build_query_prompt(
    question: str,
    document_text: str,
    total_pages: int,
    previous_question: Optional[str] = None,
    previous_answer: Optional[str] = None,
) -> str:
    """
    Build the prompt for Claude to answer questions about the document
    
    Args:
        question: User's question
        document_text: Extracted text from PDF
        total_pages: Total number of pages in PDF
        previous_question: Previous question in conversation (for follow-ups)
        previous_answer: Previous answer in conversation (for follow-ups)
        
    Returns:
        Formatted prompt for Claude
    """
    context_section = ""
    if previous_question and previous_answer:
        context_section = f"""
Previous conversation:
Q: {previous_question}
A: {previous_answer}

"""
    
    return f"""You are a technical document assistant. Answer the user's question based ONLY on the provided document. {context_section if context_section else ""}

IMPORTANT RULES:
1. Answer ONLY using information from the document below
2. If the answer is not in the document, respond with: "Not found in document."
3. When referencing information, include the page number (e.g., "According to page 5..." or "On page 10, it states...")
4. Be precise and cite specific pages
5. If you're uncertain, say so
6. {"This is a follow-up question - you may reference the previous answer for context, but still cite page numbers from the document." if previous_question else ""}

Document ({total_pages} pages):
{document_text[:50000]}  # Limit to ~50k chars to avoid token limits

Question: {question}

Provide a clear, accurate answer with page citations:"""


@router.post("/query")
async def query_document(
    file: UploadFile = File(...),
    question: str = Form(...),
    previous_question: Optional[str] = Form(None),
    previous_answer: Optional[str] = Form(None),
):
    """
    Query a PDF document with a question and get an answer with citations
    
    Streams the response in real-time
    """
    if not question or len(question.strip()) < 3:
        raise HTTPException(
            status_code=400,
            detail="Question is required and must be at least 3 characters"
        )
    
    temp_file_path = None
    
    try:
        # Validate file
        await validate_uploaded_file(file, file_type="pdf")
        
        # Save to temporary file
        with TemporaryFile(prefix="code_commander_", suffix=".pdf") as temp_path:
            temp_file_path = temp_path
            
            # Write uploaded content to temp file
            content = await file.read()
            with open(temp_path, "wb") as f:
                f.write(content)
            
            # Validate PDF
            pdf_validation = PDFProcessor.validate_pdf(temp_path)
            if not pdf_validation.get("valid"):
                raise HTTPException(
                    status_code=400,
                    detail=pdf_validation.get("error", "Invalid PDF")
                )
            
            # Extract text from PDF
            extraction_result = PDFProcessor.extract_text(temp_path)
            if not extraction_result.get("success"):
                raise HTTPException(
                    status_code=500,
                    detail="Failed to extract text from PDF"
                )
            
            document_text = extraction_result.get("text", "")
            pdf_pages = extraction_result.get("page_texts", {})
            total_pages = extraction_result.get("total_pages", 0)
            
            if not document_text or len(document_text.strip()) < 10:
                raise HTTPException(
                    status_code=400,
                    detail="PDF appears to be empty or contains no extractable text"
                )
            
            # Build prompt
            user_prompt = build_query_prompt(
                question,
                document_text,
                total_pages,
                previous_question=previous_question,
                previous_answer=previous_answer,
            )
            
            async def generate_stream():
                """Generator function for streaming response"""
                full_response = ""
                
                try:
                    # Stream the AI response
                    for chunk in claude_client.stream_completion(
                        prompt=user_prompt,
                        system_prompt="You are a technical document assistant. Answer questions accurately based only on the provided document. Always cite page numbers when referencing information.",
                        max_tokens=2048
                    ):
                        full_response += chunk
                        # Send chunk as Server-Sent Event
                        yield f"data: {json.dumps({'chunk': chunk, 'type': 'text'})}\n\n"
                    
                    # Check if answer was found
                    found_in_doc = "not found in document" not in full_response.lower()
                    
                    # Extract citations
                    citations = extract_citations_from_response(full_response, pdf_pages, question)
                    
                    # Calculate confidence
                    confidence = claude_client.calculate_confidence(full_response)
                    
                    # Send final message with citations and confidence
                    yield f"data: {json.dumps({'type': 'complete', 'confidence': confidence, 'citations': [c.dict() for c in citations], 'found_in_document': found_in_doc})}\n\n"
                    
                except Exception as e:
                    # Send error message
                    error_msg = str(e)
                    yield f"data: {json.dumps({'type': 'error', 'message': error_msg})}\n\n"
            
            return StreamingResponse(
                generate_stream(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no",
                }
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing document: {str(e)}"
        )
    finally:
        # Cleanup is handled by TemporaryFile context manager
        pass

