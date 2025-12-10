"""
Contract Hawk Router
API endpoint for analyzing contract PDFs for risks and liability issues
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from app.middleware.file_validation import validate_uploaded_file
from app.services.pdf_processor import PDFProcessor
from app.services.claude_client import ClaudeClient
from app.utils.file_cleanup import TemporaryFile
from app.models.contract_hawk import RiskItem
import json
import re

router = APIRouter(prefix="/api/contract-hawk", tags=["contract-hawk"])
claude_client = ClaudeClient()


def build_risk_analysis_prompt(document_text: str, total_pages: int) -> str:
    """
    Build the prompt for Claude to analyze contract risks
    
    Args:
        document_text: Extracted text from PDF
        total_pages: Total number of pages in PDF
        
    Returns:
        Formatted prompt for Claude
    """
    # Truncate document if very long to speed up processing
    # Most critical clauses are usually in the first 30-35k characters
    doc_length = len(document_text)
    if doc_length > 35000:
        truncated_text = document_text[:35000]
        truncation_note = f"\n\nNOTE: Document truncated from {doc_length} to 35000 characters for analysis. Focus on the most critical clauses which typically appear early in contracts."
    else:
        truncated_text = document_text
        truncation_note = ""
    
    return f"""You are a contract risk analysis expert specializing in construction contracts. Analyze the following contract document and identify potential risks, liability issues, and problematic clauses.{truncation_note}

CRITICAL CLAUSE DETECTION - SCAN FOR THESE SPECIFIC PATTERNS:

═══════════════════════════════════════════════════════════════
SEVERITY 5 - CRITICAL (Financial ruin territory)
═══════════════════════════════════════════════════════════════

1. UNCAPPED LIQUIDATED DAMAGES
   Look for: Daily/weekly penalties WITHOUT phrases like "not to exceed," "maximum," "cap," or "limit"
   Pattern: "$X per day" without a ceiling = Severity 5
   Example: "$2,500 per calendar day for each day completion is delayed" (no cap mentioned)

2. NO-DAMAGE-FOR-DELAY
   Look for: "sole remedy shall be an extension of time," "no compensation for delays," "not entitled to damages for delay"
   Pattern: Subcontractor gets time only, no money, even when delay is contractor's fault
   Example: "IN NO EVENT SHALL SUBCONTRACTOR BE ENTITLED TO ANY COMPENSATION... FOR DELAYS"

3. BROAD FORM INDEMNIFICATION  
   Look for: "regardless of negligence," "whether or not caused by," "even if caused in whole or in part by [indemnitee]"
   Pattern: Subcontractor indemnifies contractor for contractor's OWN negligence
   Example: "indemnify... REGARDLESS OF WHETHER SUCH CLAIMS ARE CAUSED... BY THE NEGLIGENCE OF CONTRACTOR"

═══════════════════════════════════════════════════════════════
SEVERITY 4 - HIGH (Significant financial exposure)
═══════════════════════════════════════════════════════════════

4. PAY-IF-PAID (not pay-when-paid)
   Look for: "contingent upon," "condition precedent," "only if contractor receives payment"
   Pattern: No owner payment = no subcontractor payment, regardless of fault
   Example: "Payment to Subcontractor is expressly contingent upon Contractor's receipt of corresponding payment from Owner"
   Note: "Pay-when-paid" (payment within X days of contractor receiving payment) = Severity 2

5. FORCED ACCELERATION AT SUB'S EXPENSE
   Look for: "accelerate... at no additional cost," "accelerate... without additional compensation," "regain schedule at subcontractor's expense"
   Pattern: Contractor can force overtime/extra crews and sub pays for it
   Example: "Contractor may direct Subcontractor to accelerate the Work at no additional cost to Contractor"

6. SHORT CLAIM NOTICE (<14 days)
   Look for: Claim deadlines of 7 days, 10 days, or similar short windows
   Pattern: Miss the window = waive the claim forever
   Example: "must be submitted in writing within seven (7) calendar days... FAILURE TO SUBMIT A TIMELY CLAIM SHALL CONSTITUTE A COMPLETE WAIVER"

7. WAIVER UPON FINAL PAYMENT
   Look for: "acceptance of final payment constitutes waiver," "final payment shall release all claims"
   Pattern: Cashing the last check = giving up right to dispute anything
   Example: "Acceptance of final payment shall constitute a waiver of all claims by Subcontractor"

8. BACK-CHARGES WITHOUT CONSENT
   Look for: "deduct without consent," "back-charge without approval," "offset from amounts due"
   Pattern: Contractor can take money from your check without agreement
   Example: "may deduct such amounts from payments due without prior consent of Subcontractor"

9. WORK DURING DISPUTES (MANDATORY CONTINUATION)
   Look for: "shall proceed with disputed work," "failure to proceed constitutes breach," "continue performance pending resolution"
   Pattern: Must keep working even when fighting over payment; refusal = breach of contract
   Example: "Subcontractor shall proceed with the work as directed... Failure to proceed shall constitute a material breach"

═══════════════════════════════════════════════════════════════
SEVERITY 3 - MEDIUM (Unfavorable but manageable)
═══════════════════════════════════════════════════════════════

10. HIGH RETAINAGE (>5%)
    Look for: Retainage percentages; flag if >5%
    Pattern: 10% retainage is aggressive; industry moving toward 5%
    Example: "retain ten percent (10%) of each progress payment"

11. SUSPENSION WITHOUT COMPENSATION
    Look for: "suspend... without additional compensation," "no payment during suspension"
    Pattern: Work stoppage with no recovery of costs
    Example: "not entitled to additional compensation for suspensions of thirty (30) days or less"

12. TERMINATION FOR CONVENIENCE WITHOUT LOST PROFIT
    Look for: "terminate for convenience," then check if lost profits are excluded
    Pattern: Can fire you anytime; you only get paid for work done, not profit on remaining work
    Example: "shall not be entitled to lost profits on uncompleted work"

13. CAPPED LIQUIDATED DAMAGES (but still high)
    Look for: LDs with caps >$50K total or >$1,500/day
    Pattern: Capped exposure but still significant
    Example: "$1,500 per day not to exceed $75,000"

═══════════════════════════════════════════════════════════════
SEVERITY 2 - LOW-MEDIUM (Standard but note it)
═══════════════════════════════════════════════════════════════

14. FLOW-DOWN PROVISIONS
    Standard in subcontracts; just note it exists

15. PAY-WHEN-PAID (not pay-if-paid)
    Payment tied to timing, not contingent on receipt
    Example: "within 7 days after Contractor receives payment" = timing mechanism, not condition

16. EXTENDED WARRANTY (>1 year standard)
    Note if warranty exceeds 1 year for general work

═══════════════════════════════════════════════════════════════
SEVERITY 1 - LOW (Standard boilerplate)
═══════════════════════════════════════════════════════════════

17. Assignment restrictions - Standard
18. Governing law - Standard  
19. Arbitration/mediation clauses - Standard
20. Independent contractor status - Standard
21. Severability - Standard

═══════════════════════════════════════════════════════════════
ANALYSIS INSTRUCTIONS
═══════════════════════════════════════════════════════════════

1. Systematically scan for ALL patterns listed above
2. Quote the actual contract language when you find a match
3. Explain each risk in plain English a foreman would understand
4. Be specific about section/article numbers
5. If a clause ALMOST matches but has mitigating language, note that
6. Don't flag standard clauses as high-risk (avoid alarm fatigue)
7. In summary, state the overall risk level: LOW / MODERATE / HIGH / CRITICAL

IMPORTANT: Do NOT skip clauses just because you found several already. Check EVERY pattern above against the document.

FINAL CHECK: Before returning your response, verify you scanned for:
□ Liquidated damages (capped or uncapped?)
□ No-damage-for-delay
□ Indemnification (broad form or limited?)
□ Payment terms (pay-if-paid or pay-when-paid?)
□ Forced acceleration
□ Claim notice deadlines
□ Final payment waiver
□ Back-charges
□ Work during disputes
□ Retainage percentage
□ Suspension terms
□ Termination provisions

If you did not find one of these, explicitly state "Not found in document" rather than omitting it.

Format your response as JSON with this structure:
{{
  "overall_risk_level": "HIGH",
  "risks": [
    {{
      "clause": "Article 3.3 - Liquidated Damages",
      "severity": 5,
      "contract_language": "the sum of TWO THOUSAND FIVE HUNDRED DOLLARS ($2,500.00) per calendar day for each day completion is delayed",
      "explanation": "Liquidated damages of $2,500 per day with NO CAP. A 60-day delay = $150,000. This is unlimited exposure."
    }}
  ],
  "summary": "This contract has [X] critical-risk clauses and [Y] high-risk clauses. The most dangerous provisions are [list top 3]. The subcontractor should negotiate [specific recommendations] before signing."
}}

Contract Document ({total_pages} pages):
{truncated_text}

IMPORTANT: Focus on finding the critical clauses listed above. Be efficient - you don't need to analyze every word, just scan for the specific patterns. If the document is truncated, analyze what you have and note that the full document may contain additional risks.

Analyze this contract systematically. Check EVERY critical pattern listed above. Provide the risk analysis in JSON format:"""


def parse_risk_analysis_response(response_text: str) -> dict:
    """
    Parse Claude's risk analysis response and extract structured data
    
    Args:
        response_text: Claude's response text
        
    Returns:
        Dict with risks and summary
    """
    try:
        # Try to extract JSON from the response
        # Look for JSON block (might be wrapped in markdown code blocks)
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to find JSON object directly
            json_match = re.search(r'\{.*"risks".*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
            else:
                # Fallback: try to parse the whole response
                json_str = response_text
        
        # Parse JSON
        data = json.loads(json_str)
        
        # Validate and structure the response
        risks = []
        if "risks" in data and isinstance(data["risks"], list):
            for risk in data["risks"]:
                if isinstance(risk, dict) and "clause" in risk and "severity" in risk and "explanation" in risk:
                    # Ensure severity is between 1-5
                    severity = max(1, min(5, int(risk.get("severity", 3))))
                    risks.append({
                        "clause": risk.get("clause", ""),
                        "severity": severity,
                        "explanation": risk.get("explanation", "")
                    })
        
        return {
            "risks": risks,
            "summary": data.get("summary", "Risk analysis completed."),
            "success": True
        }
    
    except json.JSONDecodeError:
        # If JSON parsing fails, try to extract information manually
        return {
            "risks": [],
            "summary": "Unable to parse structured response. Raw analysis: " + response_text[:500],
            "success": False,
            "raw_response": response_text
        }
    except Exception as e:
        return {
            "risks": [],
            "summary": f"Error parsing response: {str(e)}",
            "success": False,
            "raw_response": response_text
        }


@router.post("/analyze")
async def analyze_contract(file: UploadFile = File(...)):
    """
    Analyze a contract PDF for risks and liability issues
    
    Streams the response in real-time
    """
    temp_file_path = None
    
    try:
        # Validate file
        await validate_uploaded_file(file, file_type="pdf")
        
        # Save to temporary file
        with TemporaryFile(prefix="contract_hawk_", suffix=".pdf") as temp_path:
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
            total_pages = extraction_result.get("total_pages", 0)
            
            if not document_text or len(document_text.strip()) < 10:
                raise HTTPException(
                    status_code=400,
                    detail="PDF appears to be empty or contains no extractable text"
                )
            
            # Log document size for performance monitoring
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Contract Hawk: Processing {total_pages} pages, {len(document_text)} characters")
            
            # Build prompt (with smart truncation if needed)
            user_prompt = build_risk_analysis_prompt(document_text, total_pages)
            
            async def generate_stream():
                """Generator function for streaming response"""
                full_response = ""
                
                try:
                    # Send progress updates for each stage
                    progress_stages = [
                        "Extracting text from PDF...",
                        "Analyzing critical clauses (Severity 5)...",
                        "Checking high-risk clauses (Severity 4)...",
                        "Scanning for medium-risk items (Severity 3)...",
                        "Reviewing standard clauses (Severity 1-2)...",
                        "Compiling risk analysis...",
                    ]
                    
                    import asyncio
                    import time
                    
                    # Stage 1: PDF extraction (already done, but notify user)
                    yield f"data: {json.dumps({'type': 'progress', 'stage': 1, 'message': progress_stages[0]})}\n\n"
                    await asyncio.sleep(0.3)  # Small delay so user sees the message
                    
                    # Stage 2: Start AI analysis
                    yield f"data: {json.dumps({'type': 'progress', 'stage': 2, 'message': progress_stages[1]})}\n\n"
                    await asyncio.sleep(0.2)
                    
                    # Stream the AI response with background progress updates
                    from collections import deque
                    
                    # Queue for progress messages from background task
                    progress_queue = deque()
                    streaming_complete = False
                    
                    # Background task to send progress updates at fixed intervals
                    async def send_progress_updates():
                        """Send progress updates at fixed intervals independently"""
                        progress_updates = [
                            (1.5, 2, "Checking high-risk clauses (Severity 4)..."),
                            (3.0, 3, "Scanning for medium-risk items (Severity 3)..."),
                            (5.0, 4, "Reviewing standard clauses (Severity 1-2)..."),
                            (7.0, 5, "Compiling risk analysis..."),
                        ]
                        
                        for delay, stage_idx, message in progress_updates:
                            await asyncio.sleep(delay)
                            if not streaming_complete:
                                logger.info(f"Contract Hawk Progress: {message}")
                                progress_queue.append((stage_idx, message))
                    
                    # Start background progress task
                    progress_task = asyncio.create_task(send_progress_updates())
                    
                    logger.info("Starting Contract Hawk AI analysis stream...")
                    chunk_count = 0
                    
                    try:
                        # Stream the AI response
                        for chunk in claude_client.stream_completion(
                            prompt=user_prompt,
                            system_prompt="You are a contract risk analysis expert. Analyze contracts for potential risks, liability issues, and problematic clauses. Always respond in valid JSON format. Be concise but thorough.",
                            max_tokens=3072  # Reduced from 4096 - still plenty for comprehensive analysis
                        ):
                            full_response += chunk
                            chunk_count += 1
                            
                            # Send any pending progress updates from the queue
                            while progress_queue:
                                stage_idx, message = progress_queue.popleft()
                                yield f"data: {json.dumps({'type': 'progress', 'stage': stage_idx, 'message': message})}\n\n"
                            
                            # Send chunk as Server-Sent Event
                            yield f"data: {json.dumps({'chunk': chunk, 'type': 'text'})}\n\n"
                    finally:
                        # Mark streaming as complete and cancel progress task
                        streaming_complete = True
                        progress_task.cancel()
                        
                        # Send any remaining progress updates
                        while progress_queue:
                            stage_idx, message = progress_queue.popleft()
                            yield f"data: {json.dumps({'type': 'progress', 'stage': stage_idx, 'message': message})}\n\n"
                    
                    # Final compilation stage
                    yield f"data: {json.dumps({'type': 'progress', 'stage': 6, 'message': progress_stages[5]})}\n\n"
                    await asyncio.sleep(0.1)
                    
                    # Parse the response
                    parsed_data = parse_risk_analysis_response(full_response)
                    
                    # Calculate confidence
                    confidence = claude_client.calculate_confidence(full_response)
                    
                    # Send final message with structured data
                    yield f"data: {json.dumps({'type': 'complete', 'confidence': confidence, 'risks': parsed_data.get('risks', []), 'overall_risk_level': parsed_data.get('overall_risk_level'), 'summary': parsed_data.get('summary', ''), 'success': parsed_data.get('success', True)})}\n\n"
                    
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
            detail=f"Error processing contract: {str(e)}"
        )
    finally:
        # Cleanup is handled by TemporaryFile context manager
        pass

