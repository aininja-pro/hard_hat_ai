"""
Lookahead Builder Router
API endpoint for generating 2-week construction schedules from photos or text
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
from app.middleware.file_validation import validate_uploaded_file
from app.services.vision_client import VisionClient
from app.services.claude_client import ClaudeClient
from app.utils.file_cleanup import TemporaryFile
import json
import re
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/lookahead-builder", tags=["lookahead-builder"])
claude_client = ClaudeClient()

# Initialize vision client lazily to avoid import-time errors
def get_vision_client():
    try:
        return VisionClient()
    except Exception as e:
        logger.error(f"Failed to initialize VisionClient: {e}")
        raise HTTPException(status_code=500, detail="Vision client initialization failed")

# System prompt
SYSTEM_PROMPT = """You are an experienced construction superintendent with 25+ years in commercial and residential construction. Your job is to look at a room or space and generate a realistic 2-week lookahead schedule.

You understand construction sequencing, trade coordination, and realistic crew productivity. You know that your schedule is a STARTING POINT that the foreman will adjust based on factors you can't see.

ALWAYS BE HONEST ABOUT UNCERTAINTY. Construction professionals respect accuracy over false confidence."""

# Photo analysis prompt
PHOTO_PROMPT = """You are an experienced construction superintendent creating a 2-week lookahead schedule.

USER'S GOAL: {user_goal}

STEP 1: ANALYZE THE IMAGE(S)

First, examine the photo(s) and identify:
1. What type of space is this? (bathroom, office, hallway, commercial kitchen, etc.)
2. What construction phase does it appear to be in?
   - Demo/gutted
   - Rough framing complete
   - MEP rough-in in progress
   - MEP rough-in complete
   - Insulation/vapor barrier
   - Drywall hung
   - Drywall finished
   - Paint/prime
   - Finish trim
   - Punch list
3. What trades appear to have worked or need to work here?
4. Approximate dimensions (estimate from visual cues like doors, outlets, ceiling tiles)

STEP 2: VALIDATE IMAGE QUALITY

Before proceeding, assess if you can generate a useful schedule:

✅ PROCEED if you can clearly identify:
- The type of space
- The current construction phase
- Major elements (walls, ceiling, floor condition)

⚠️ ASK FOR CLARIFICATION if:
- Image is blurry or dark
- You can only see a small portion of the space
- The construction phase is ambiguous
- Multiple interpretations are possible

❌ DECLINE if:
- Image is unreadable
- It's not a construction site
- There's not enough context to schedule anything

STEP 3: IDENTIFY REQUIRED INFORMATION

If not provided, ASK the user for:
1. What trade/scope is this schedule for? (Or "all remaining trades"?)
2. Are there any schedule constraints? (inspection dates, material deliveries, etc.)
3. What's the target completion for this space?

If user doesn't provide this, make reasonable assumptions and STATE THEM CLEARLY.

STEP 4: GENERATE THE SCHEDULE

Based on your analysis, create a 2-week lookahead schedule.

SCHEDULING RULES:
1. Follow standard construction sequencing:
   - Structure → MEP rough → Inspections → Insulation → Drywall → MEP trim → Finishes → Punch
2. Account for inspection hold points (rough MEP before close-in)
3. Allow realistic task durations - don't over-compress
4. Account for cure times (mud, paint, concrete)
5. Consider trade stacking - don't put too many trades in one space simultaneously
6. Crew sizes should reflect the visible scope, not exceed practical limits

CREW SIZE GUIDELINES (adjust based on space size):
- Small bathroom: 1-2 workers per trade
- Standard office/room: 2-3 workers
- Large open space: 3-5 workers
- Size crews for productivity, not just speed

PRODUCTIVITY ASSUMPTIONS (typical, adjust for complexity):
- Drywall hang: 1,500-2,000 SF per day (2-man crew)
- Drywall finish: 1,000-1,500 SF per day (2-man crew)
- Paint: 800-1,200 SF per day (2-man crew)
- Electrical rough (per outlet/switch): 15-20 per day (2-man crew)
- Plumbing rough: 4-6 fixtures per day (2-man crew)

STEP 5: FORMAT THE OUTPUT

Provide the schedule as a table with Day, Date, Task, Trade, Crew Size, Duration, Materials/Notes.

Include:
- Weekend gaps (no work Sat/Sun unless specified)
- Inspection hold points clearly marked
- Cure time / dry time where applicable
- Material lead time warnings if relevant

STEP 6: STATE YOUR ASSUMPTIONS

After the schedule, list assumptions made, questions to verify, confidence level, and any warnings.

FORMAT YOUR RESPONSE AS JSON:

{{
  "image_analysis": {{
    "space_type": "string",
    "estimated_dimensions": "string",
    "current_phase": "string",
    "visible_conditions": ["list of observations"],
    "trades_identified": ["list"]
  }},
  "schedule": [
    {{
      "day": 1,
      "date": "Mon 12/16",
      "task": "string",
      "trade": "string",
      "crew_size": 2,
      "duration_hours": 8,
      "materials": "string",
      "notes": "string"
    }}
  ],
  "assumptions": ["list of assumptions made"],
  "verify_with_foreman": ["list of questions"],
  "confidence_level": "Medium",
  "confidence_explanation": "string",
  "warnings": ["any critical warnings"]
}}

CRITICAL: Your response must be ONLY valid JSON. Do not include any explanatory text before or after the JSON. Start your response with {{ and end with }}."""

# Text-only prompt (no image)
TEXT_PROMPT = """You are an experienced construction superintendent creating a 2-week lookahead schedule based on a text description.

The user will describe a space and what work needs to be done. Generate a realistic 2-week schedule.

[Same SCHEDULING RULES, CREW SIZE GUIDELINES, PRODUCTIVITY ASSUMPTIONS as photo prompt]

Since there's no photo, you'll need to:
1. Ask clarifying questions if the description is vague
2. Make reasonable assumptions and state them
3. Be explicit that crew sizes and durations are estimates

[Same output format as photo prompt]

CRITICAL: Your response must be ONLY valid JSON. Do not include any explanatory text before or after the JSON. Start your response with { and end with }."""


def parse_schedule_response(response_text: str) -> dict:
    """
    Parse Claude's schedule response and extract structured data
    
    Args:
        response_text: Claude's response text
        
    Returns:
        Dict with schedule data
    """
    try:
        # Try multiple strategies to extract JSON
        # Strategy 1: Look for JSON in markdown code blocks
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Strategy 2: Find JSON object by matching braces
            brace_start = response_text.find('{')
            if brace_start != -1:
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
        
        # Parse JSON
        data = json.loads(json_str)
        
        return {
            "success": True,
            "data": data,
        }
    
    except json.JSONDecodeError as e:
        return {
            "success": False,
            "error": f"JSON parsing error: {str(e)}",
            "raw_response": response_text[:1000],
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "raw_response": response_text[:1000],
        }


@router.post("/generate")
async def generate_schedule(
    image_files: List[UploadFile] = File(..., description="Construction site photos (can upload multiple)"),
    user_goal: str = Form(..., description="What are you trying to accomplish? (required)"),
    trade_scope: str = Form(None, description="Optional trade/scope (e.g., 'all trades', 'electrical only')"),
    constraints: str = Form(None, description="Optional schedule constraints"),
):
    """
    Generate a 2-week lookahead schedule from photos and user goal
    
    Streams the response in real-time
    """
    try:
        logger.info("=" * 50)
        logger.info("LOOKAHEAD BUILDER REQUEST RECEIVED")
        logger.info(f"Number of image files: {len(image_files) if image_files else 0}")
        logger.info(f"User goal: {user_goal[:100] if user_goal else 'None'}...")
        logger.info("=" * 50)
        
        if not user_goal or not user_goal.strip():
            raise HTTPException(
                status_code=400,
                detail="user_goal is required - describe what you're trying to accomplish"
            )
        
        if not image_files or len(image_files) == 0:
            raise HTTPException(
                status_code=400,
                detail="At least one photo must be provided"
            )
        
        temp_file_paths = []
        # Validate and save all images
        image_paths = []
        for idx, image_file in enumerate(image_files):
            # Validate image
            await validate_uploaded_file(image_file, file_type="image")
            
            # Create temporary file using tempfile directly (not FileCleanup which might auto-delete)
            import tempfile
            import os
            temp_fd, temp_path = tempfile.mkstemp(prefix=f"lookahead_image_{idx}_", suffix=".jpg")
            temp_file_paths.append(temp_path)
            
            try:
                # Write uploaded content to temp file
                content = await image_file.read()
                with os.fdopen(temp_fd, "wb") as f:
                    f.write(content)
                
                # Verify file was written
                if not os.path.exists(temp_path) or os.path.getsize(temp_path) == 0:
                    raise HTTPException(status_code=500, detail=f"Failed to save image file {idx}")
                
                image_paths.append(temp_path)
                logger.info(f"Saved image {idx} to {temp_path} ({os.path.getsize(temp_path)} bytes)")
            except Exception as e:
                # Close file descriptor if write failed
                try:
                    os.close(temp_fd)
                except:
                    pass
                # Clean up partial file
                try:
                    if os.path.exists(temp_path):
                        os.unlink(temp_path)
                except:
                    pass
                raise HTTPException(status_code=500, detail=f"Error saving image {idx}: {str(e)}")
        
        # Build prompt with user goal and context
        prompt = PHOTO_PROMPT.format(user_goal=user_goal.strip())
        if len(image_paths) > 1:
            prompt += f"\n\nNOTE: User provided {len(image_paths)} photos from different angles. Analyze all photos to get a complete understanding of the space and work needed."
        if trade_scope:
            prompt += f"\n\nTRADE SCOPE: {trade_scope}"
        if constraints:
            prompt += f"\n\nCONSTRAINTS: {constraints}"
        
        async def generate_stream():
            """Generator function for streaming response"""
            full_response = ""
            
            try:
                logger.info("=" * 50)
                logger.info("LOOKAHEAD BUILDER REQUEST RECEIVED")
                logger.info(f"Number of images: {len(image_paths)}")
                logger.info(f"User goal: {user_goal[:100]}...")
                logger.info("=" * 50)
                
                # Send initial message to indicate processing started
                yield f"data: {json.dumps({'type': 'text', 'chunk': 'Analyzing images...'})}\n\n"
                
                # Stream the vision analysis with all images
                logger.info(f"Calling vision_client.stream_image_analysis with {len(image_paths)} images...")
                # Verify all image files exist before calling vision API
                import os
                for img_path in image_paths:
                    if not os.path.exists(img_path):
                        raise Exception(f"Image file missing: {img_path}")
                    logger.info(f"  - {img_path} exists ({os.path.getsize(img_path)} bytes)")
                
                chunk_count = 0
                try:
                    vision_client = get_vision_client()
                    for chunk in vision_client.stream_image_analysis(
                        image_paths=image_paths,
                        prompt=prompt,
                        system_prompt=SYSTEM_PROMPT,
                        max_tokens=4096
                    ):
                        chunk_count += 1
                        full_response += chunk
                        # Send chunk as Server-Sent Event immediately
                        yield f"data: {json.dumps({'chunk': chunk, 'type': 'text'})}\n\n"
                        
                        # Log progress every 10 chunks
                        if chunk_count % 10 == 0:
                            logger.info(f"Received {chunk_count} chunks, {len(full_response)} total characters")
                    
                    logger.info(f"Vision analysis complete! Total: {chunk_count} chunks, {len(full_response)} characters")
                except Exception as vision_error:
                    logger.error(f"Vision API error: {str(vision_error)}", exc_info=True)
                    yield f"data: {json.dumps({'type': 'error', 'message': f'Vision API error: {str(vision_error)}'})}\n\n"
                    return
                finally:
                    # Clean up temporary files AFTER vision API call completes
                    # This ensures files persist during the API call
                    import os
                    for temp_path in temp_file_paths:
                        try:
                            if os.path.exists(temp_path):
                                os.unlink(temp_path)
                                logger.info(f"Cleaned up temp file: {temp_path}")
                        except Exception as cleanup_error:
                            logger.warning(f"Failed to cleanup {temp_path}: {cleanup_error}")
                
                if not full_response:
                    yield f"data: {json.dumps({'type': 'error', 'message': 'No response from vision API'})}\n\n"
                    return
                
                # Parse the response
                logger.info("Parsing schedule response")
                parsed_data = parse_schedule_response(full_response)
                
                if not parsed_data.get("success"):
                    error_msg = parsed_data.get("error", "Failed to parse response")
                    logger.error(f"Parse error: {error_msg}")
                    yield f"data: {json.dumps({'type': 'error', 'message': error_msg, 'raw_preview': full_response[:500]})}\n\n"
                    return
                
                # Calculate confidence
                confidence = claude_client.calculate_confidence(full_response)
                
                # Send final message with structured data
                logger.info("Sending complete response")
                yield f"data: {json.dumps({'type': 'complete', 'confidence': confidence, 'schedule_data': parsed_data.get('data', {})})}\n\n"
                
            except Exception as e:
                # Send error message
                import traceback
                error_msg = f"{str(e)}\n{traceback.format_exc()}"
                logger.error(f"Error in generate_stream: {error_msg}")
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
            finally:
                # Final cleanup - ensure files are deleted even on error
                import os
                for temp_path in temp_file_paths:
                    try:
                        if os.path.exists(temp_path):
                            os.unlink(temp_path)
                            logger.info(f"Final cleanup: {temp_path}")
                    except Exception as cleanup_error:
                        logger.warning(f"Failed final cleanup {temp_path}: {cleanup_error}")
        
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
        import traceback
        error_msg = f"Error generating schedule: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_msg)
        # Clean up files on error (before streaming starts)
        if 'temp_file_paths' in locals() and temp_file_paths:
            import os
            for temp_path in temp_file_paths:
                try:
                    if os.path.exists(temp_path):
                        os.unlink(temp_path)
                except:
                    pass
        raise HTTPException(
            status_code=500,
            detail=f"Error generating schedule: {str(e)}"
        )
    # Note: File cleanup happens inside generate_stream() after vision API completes

