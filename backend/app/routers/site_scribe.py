"""
Site Scribe Router
API endpoint for transforming rough field notes into professional emails
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.models.site_scribe import SiteScribeRequest
from app.services.claude_client import ClaudeClient
from typing import Optional
import json
import asyncio

router = APIRouter(prefix="/api/site-scribe", tags=["site-scribe"])
claude_client = ClaudeClient()


def get_system_prompt(tone: str) -> str:
    """
    Generate system prompt based on tone selection
    
    Args:
        tone: "neutral", "firm", or "cya"
        
    Returns:
        System prompt string
    """
    base_prompt = """You are a professional construction communication assistant. Your job is to transform rough, casual, or even angry field notes into polished, professional emails suitable for business communication.

Key principles:
- Maintain all factual information and important details
- Use proper business email formatting
- Keep the message clear and professional
- Preserve the urgency or importance of the original message
- Use appropriate construction industry terminology
"""
    
    tone_instructions = {
        "neutral": """
Tone: Professional and balanced. Use a straightforward, respectful tone that conveys information clearly without being overly formal or casual.
""",
        "firm": """
Tone: Direct and assertive. Use a confident, no-nonsense tone that shows authority and urgency. Be clear about expectations and deadlines.
""",
        "cya": """
Tone: CYA (Cover Your Ass) - Document everything thoroughly. Use a careful, detailed tone that creates a clear paper trail. Include specific dates, times, names, and actions. Emphasize what was communicated, when, and to whom. Make it clear that all parties were informed.
"""
    }
    
    return base_prompt + tone_instructions.get(tone, tone_instructions["neutral"])


def get_user_prompt(
    raw_text: str,
    to_email: Optional[str] = None,
    from_email: Optional[str] = None,
    subject: Optional[str] = None,
    cc: Optional[str] = None,
    bcc: Optional[str] = None,
) -> str:
    """
    Generate user prompt from raw input text and email metadata
    
    Args:
        raw_text: The raw field notes from the user
        to_email: Recipient email address
        from_email: Sender email address
        subject: Optional subject line
        cc: CC recipients (comma-separated)
        bcc: BCC recipients (comma-separated)
        
    Returns:
        Formatted prompt for Claude
    """
    email_metadata = []
    if to_email:
        email_metadata.append(f"To: {to_email}")
    if from_email:
        email_metadata.append(f"From: {from_email}")
    if cc:
        email_metadata.append(f"CC: {cc}")
    if bcc:
        email_metadata.append(f"BCC: {bcc}")
    if subject:
        email_metadata.append(f"Subject: {subject}")
    
    metadata_section = ""
    if email_metadata:
        metadata_section = "\n\nEmail Details:\n" + "\n".join(email_metadata) + "\n"
    
    subject_instruction = "Use the provided subject line above." if subject else "Generate an appropriate subject line."
    
    return f"""Transform the following field notes into a professional email. Maintain all important information, but make it suitable for sending to clients, supervisors, or other stakeholders.
{metadata_section}
Field Notes:
{raw_text}

Please generate a professional email that:
1. {subject_instruction}
2. Includes a professional greeting (use recipient name if provided)
3. Transforms the rough notes into clear, professional language
4. Maintains all important details and facts
5. Ends with an appropriate closing and signature

Generate the complete email now:"""


@router.post("/transform")
async def transform_notes(request: SiteScribeRequest):
    """
    Transform rough field notes into a professional email
    
    Streams the response in real-time as the AI generates it
    """
    if not request.text or len(request.text.strip()) < 5:
        raise HTTPException(
            status_code=400,
            detail="Text input is required and must be at least 5 characters"
        )
    
    # Build prompts
    system_prompt = get_system_prompt(request.tone)
    user_prompt = get_user_prompt(
        raw_text=request.text,
        to_email=request.to_email,
        from_email=request.from_email,
        subject=request.subject,
        cc=request.cc,
        bcc=request.bcc,
    )
    
    async def generate_stream():
        """Generator function for streaming response"""
        full_response = ""
        
        try:
            # Stream the AI response (synchronous generator)
            for chunk in claude_client.stream_completion(
                prompt=user_prompt,
                system_prompt=system_prompt,
                max_tokens=2048
            ):
                full_response += chunk
                # Send chunk as Server-Sent Event
                yield f"data: {json.dumps({'chunk': chunk, 'type': 'text'})}\n\n"
            
            # Calculate confidence after full response
            confidence = claude_client.calculate_confidence(full_response)
            
            # Send final message with confidence
            yield f"data: {json.dumps({'type': 'complete', 'confidence': confidence})}\n\n"
            
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
            "X-Accel-Buffering": "no",  # Disable buffering for nginx
        }
    )

