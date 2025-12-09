"""
Submittal Scrubber Router
API endpoint for comparing specification documents with product data for compliance
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from app.middleware.file_validation import validate_uploaded_file
from app.services.pdf_processor import PDFProcessor
from app.services.claude_client import ClaudeClient
from app.utils.file_cleanup import TemporaryFile
from app.models.submittal_scrubber import ComplianceItem
import json
import re

router = APIRouter(prefix="/api/submittal-scrubber", tags=["submittal-scrubber"])
claude_client = ClaudeClient()


def build_compliance_prompt(spec_text: str, product_text: str, spec_pages: int, product_pages: int, model_number: str = None) -> str:
    """
    Build the prompt for Claude to compare spec and product data
    
    Args:
        spec_text: Extracted text from specification PDF
        product_text: Extracted text from product data PDF
        spec_pages: Total pages in spec document
        product_pages: Total pages in product document
        model_number: Optional specific model number to focus on
        
    Returns:
        Formatted prompt for Claude
    """
    model_focus = ""
    if model_number:
        model_focus = f"\n\nMODEL FOCUS: For this comparison, focus specifically on model {model_number} from the product data."
    
    return f"""You are a construction submittal review expert. Compare the specification document with the product data document to determine compliance.

Your task is to:
1. Identify key requirements from the specification document
2. Find corresponding information in the product data document
3. Determine if the product meets, partially meets, or fails to meet each requirement
4. Provide specific text evidence from both documents

TABLE PARSING RULES:
- When product data contains tables with multiple models, identify the SPECIFIC MODEL that matches the specification requirements
- Extract values from the correct row - do not mark as "not stated" if the value exists in a table
- Look for model numbers, part numbers, or product codes that match the specification
- If multiple models are listed, determine which one(s) are relevant to the spec requirements
{model_focus}

COMPLIANCE STATUS DEFINITIONS:
- PASS: Product clearly meets the requirement with supporting evidence
- WARN: Product may meet requirement but information is unclear, incomplete, or requires clarification
- FAIL: Product does not meet the requirement or contradicts the specification

ANALYSIS INSTRUCTIONS:
1. Extract specific requirements from the specification (material properties, performance standards, dimensions, certifications, etc.)
2. Search the product data for corresponding information - pay special attention to tables and model-specific data
3. When product data contains tables, identify the correct model/row that matches the spec requirements
4. Compare requirements with product capabilities/features from the correct model
5. Quote actual text from both documents as evidence, including table values when applicable
6. Be specific about section numbers or page references when possible
7. Flag any missing information as WARN or FAIL depending on criticality
8. Focus on technical requirements, not marketing language
9. If a value exists in a product data table but you initially missed it, re-check and update your assessment

CRITICAL: Your response must be ONLY valid JSON. Do not include any explanatory text before or after the JSON. Start your response with {{ and end with }}.

Format your response as JSON with this structure:
{{
  "compliance_items": [
    {{
      "requirement": "Minimum compressive strength: 3000 psi",
      "spec_text": "Section 3.2.1: Concrete shall have a minimum 28-day compressive strength of 3000 psi",
      "product_text": "Product datasheet page 2: Compressive strength tested at 3500 psi at 28 days",
      "status": "pass",
      "notes": "Product exceeds minimum requirement"
    }},
    {{
      "requirement": "UL Listed certification required",
      "spec_text": "Section 5.1: All electrical components must be UL Listed",
      "product_text": "Product brochure mentions 'meets UL standards' but no listing number provided",
      "status": "warn",
      "notes": "Certification status unclear - need to verify actual UL listing number"
    }},
    {{
      "requirement": "Maximum weight: 50 lbs",
      "spec_text": "Section 2.3: Unit weight shall not exceed 50 pounds",
      "product_text": "Product specifications: Weight 65 lbs",
      "status": "fail",
      "notes": "Product exceeds maximum weight requirement by 15 lbs"
    }}
  ],
  "summary": "Overall compliance assessment. Include count of pass/warn/fail items and key findings."
}}

Specification Document ({spec_pages} pages):
{spec_text[:40000]}  # Limit to ~40k chars per document

Product Data Document ({product_pages} pages):
{product_text[:40000]}  # Limit to ~40k chars per document

Compare these documents systematically. Extract requirements from the spec, find corresponding information in the product data, and provide compliance analysis. Return ONLY valid JSON starting with {{ and ending with }}:"""


def parse_compliance_response(response_text: str) -> dict:
    """
    Parse Claude's compliance analysis response and extract structured data
    
    Args:
        response_text: Claude's response text
        
    Returns:
        Dict with compliance items and summary
    """
    try:
        # Try multiple strategies to extract JSON
        
        # Strategy 1: Look for JSON in markdown code blocks
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Strategy 2: Find JSON object that contains "compliance_items"
            # Use greedy matching to get the complete JSON object
            json_match = re.search(r'(\{.*?"compliance_items".*?\})', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # Strategy 3: Find JSON object by matching braces properly
                # Find the first opening brace
                brace_start = response_text.find('{')
                if brace_start != -1:
                    # Find matching closing brace by counting braces
                    brace_count = 0
                    brace_end = brace_start
                    for i in range(brace_start, len(response_text)):
                        if response_text[i] == '{':
                            brace_count += 1
                        elif response_text[i] == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                brace_end = i + 1
                                break
                    if brace_end > brace_start:
                        json_str = response_text[brace_start:brace_end]
                    else:
                        # If we couldn't find matching brace, try to find JSON with "compliance_items"
                        # Look for opening brace before "compliance_items"
                        compliance_idx = response_text.find('"compliance_items"')
                        if compliance_idx != -1:
                            # Find opening brace before this
                            brace_start = response_text.rfind('{', 0, compliance_idx)
                            if brace_start != -1:
                                # Try to find matching closing brace
                                brace_count = 0
                                brace_end = brace_start
                                for i in range(brace_start, len(response_text)):
                                    if response_text[i] == '{':
                                        brace_count += 1
                                    elif response_text[i] == '}':
                                        brace_count -= 1
                                        if brace_count == 0:
                                            brace_end = i + 1
                                            break
                                if brace_end > brace_start:
                                    json_str = response_text[brace_start:brace_end]
                                else:
                                    json_str = response_text[brace_start:]
                            else:
                                json_str = response_text
                        else:
                            json_str = response_text
                else:
                    # Fallback: try to parse the whole response
                    json_str = response_text
        
        # Parse JSON
        data = json.loads(json_str)
        
        # Validate and structure the response
        compliance_items = []
        if "compliance_items" in data and isinstance(data["compliance_items"], list):
            for item in data["compliance_items"]:
                if isinstance(item, dict) and "requirement" in item and "status" in item:
                    # Validate status
                    status = item.get("status", "").lower()
                    if status not in ["pass", "warn", "fail"]:
                        # Try to normalize status
                        if "pass" in status or "meet" in status:
                            status = "pass"
                        elif "warn" in status or "partial" in status or "unclear" in status:
                            status = "warn"
                        elif "fail" in status or "not" in status:
                            status = "fail"
                        else:
                            status = "warn"  # Default to warn if unclear
                    
                    compliance_items.append({
                        "requirement": item.get("requirement", ""),
                        "spec_text": item.get("spec_text", ""),
                        "product_text": item.get("product_text", ""),
                        "status": status,
                        "notes": item.get("notes")
                    })
        
        return {
            "compliance_items": compliance_items,
            "summary": data.get("summary", "Compliance analysis completed."),
            "success": True
        }
    
    except json.JSONDecodeError:
        # If JSON parsing fails, try to extract information manually
        return {
            "compliance_items": [],
            "summary": "Unable to parse structured response. Raw analysis: " + response_text[:500],
            "success": False,
            "raw_response": response_text
        }
    except Exception as e:
        return {
            "compliance_items": [],
            "summary": f"Error parsing response: {str(e)}",
            "success": False,
            "raw_response": response_text
        }


@router.post("/compare")
async def compare_submittals(
    spec_file: UploadFile = File(..., description="Specification document PDF"),
    product_file: UploadFile = File(..., description="Product data document PDF"),
    model_number: str = Form(None, description="Optional specific model number to focus on"),
):
    """
    Compare specification document with product data for compliance
    
    Streams the response in real-time
    """
    spec_temp_path = None
    product_temp_path = None
    
    try:
        # Validate files
        await validate_uploaded_file(spec_file, file_type="pdf")
        await validate_uploaded_file(product_file, file_type="pdf")
        
        # Save to temporary files
        with TemporaryFile(prefix="submittal_spec_", suffix=".pdf") as spec_path:
            with TemporaryFile(prefix="submittal_product_", suffix=".pdf") as product_path:
                spec_temp_path = spec_path
                product_temp_path = product_path
                
                # Write uploaded content to temp files
                spec_content = await spec_file.read()
                product_content = await product_file.read()
                
                with open(spec_path, "wb") as f:
                    f.write(spec_content)
                with open(product_path, "wb") as f:
                    f.write(product_content)
                
                # Validate PDFs
                spec_validation = PDFProcessor.validate_pdf(spec_path)
                if not spec_validation.get("valid"):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid specification PDF: {spec_validation.get('error', 'Unknown error')}"
                    )
                
                product_validation = PDFProcessor.validate_pdf(product_path)
                if not product_validation.get("valid"):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid product data PDF: {product_validation.get('error', 'Unknown error')}"
                    )
                
                # Extract text from both PDFs
                spec_extraction = PDFProcessor.extract_text(spec_path)
                if not spec_extraction.get("success"):
                    raise HTTPException(
                        status_code=500,
                        detail="Failed to extract text from specification PDF"
                    )
                
                product_extraction = PDFProcessor.extract_text(product_path)
                if not product_extraction.get("success"):
                    raise HTTPException(
                        status_code=500,
                        detail="Failed to extract text from product data PDF"
                    )
                
                spec_text = spec_extraction.get("text", "")
                product_text = product_extraction.get("text", "")
                spec_pages = spec_extraction.get("total_pages", 0)
                product_pages = product_extraction.get("total_pages", 0)
                
                if not spec_text or len(spec_text.strip()) < 10:
                    raise HTTPException(
                        status_code=400,
                        detail="Specification PDF appears to be empty or contains no extractable text"
                    )
                
                if not product_text or len(product_text.strip()) < 10:
                    raise HTTPException(
                        status_code=400,
                        detail="Product data PDF appears to be empty or contains no extractable text"
                    )
                
                # Build prompt
                user_prompt = build_compliance_prompt(spec_text, product_text, spec_pages, product_pages, model_number)
                
                async def generate_stream():
                    """Generator function for streaming response"""
                    full_response = ""
                    
                    try:
                        # Stream the AI response
                        for chunk in claude_client.stream_completion(
                            prompt=user_prompt,
                            system_prompt="You are a construction submittal review expert. Compare specification documents with product data to determine compliance. Always respond in valid JSON format.",
                            max_tokens=4096
                        ):
                            full_response += chunk
                            # Send chunk as Server-Sent Event
                            yield f"data: {json.dumps({'chunk': chunk, 'type': 'text'})}\n\n"
                        
                        # Parse the response
                        parsed_data = parse_compliance_response(full_response)
                        
                        # Calculate confidence
                        confidence = claude_client.calculate_confidence(full_response)
                        
                        # Send final message with structured data
                        yield f"data: {json.dumps({'type': 'complete', 'confidence': confidence, 'compliance_items': parsed_data.get('compliance_items', []), 'summary': parsed_data.get('summary', ''), 'success': parsed_data.get('success', True)})}\n\n"
                        
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
            detail=f"Error processing submittals: {str(e)}"
        )
    finally:
        # Cleanup is handled by TemporaryFile context manager
        pass

