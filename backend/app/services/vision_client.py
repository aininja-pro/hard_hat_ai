"""
Vision Client Service
Handles Claude Vision API integration for image analysis
"""

import os
import base64
import tempfile
from typing import Optional, Dict, Any
from anthropic import Anthropic
import logging
from PIL import Image
import io

logger = logging.getLogger(__name__)

# Claude API limit: 5 MB base64 encoded = ~3.75 MB raw image
MAX_IMAGE_SIZE_BYTES = 3_750_000  # 3.75 MB raw (will be ~5 MB base64)
MAX_IMAGE_DIMENSION = 2048  # Max width or height in pixels


class VisionClient:
    """Service for interacting with Claude Vision API"""

    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
        
        self.client = Anthropic(api_key=api_key)
        self.model = "claude-3-opus-20240229"  # Claude 3 Opus supports vision

    def compress_image(self, image_path: str) -> str:
        """
        Compress and resize image if needed to meet Claude API size limits
        Returns path to compressed image (may be original if no compression needed)
        
        Args:
            image_path: Path to original image file
            
        Returns:
            Path to compressed image file (temporary file if compressed, original if not)
        """
        import os
        
        original_size = os.path.getsize(image_path)
        logger.info(f"Checking image size: {image_path} ({original_size} bytes)")
        
        # If image is already small enough, return original path
        if original_size <= MAX_IMAGE_SIZE_BYTES:
            logger.info("Image is already within size limit, no compression needed")
            return image_path
        
        try:
            # Open and process image
            with Image.open(image_path) as img:
                # Convert to RGB if necessary (removes alpha channel, reduces size)
                if img.mode in ('RGBA', 'LA', 'P'):
                    # Create white background for transparency
                    rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = rgb_img
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Get original dimensions
                width, height = img.size
                logger.info(f"Original dimensions: {width}x{height}")
                
                # Resize if dimensions are too large
                if width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION:
                    # Calculate new dimensions maintaining aspect ratio
                    ratio = min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height)
                    new_width = int(width * ratio)
                    new_height = int(height * ratio)
                    logger.info(f"Resizing to: {new_width}x{new_height}")
                    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                # Save to temporary file with quality compression
                # Try different quality levels until we're under the limit
                temp_fd, temp_path = tempfile.mkstemp(suffix='.jpg', prefix='compressed_')
                os.close(temp_fd)
                
                quality = 85
                while quality >= 50:
                    # Save with current quality
                    img.save(temp_path, 'JPEG', quality=quality, optimize=True)
                    compressed_size = os.path.getsize(temp_path)
                    
                    logger.info(f"Compressed with quality {quality}: {compressed_size} bytes")
                    
                    if compressed_size <= MAX_IMAGE_SIZE_BYTES:
                        logger.info(f"✓ Image compressed successfully: {compressed_size} bytes (was {original_size} bytes)")
                        return temp_path
                    
                    # Try lower quality
                    quality -= 10
                
                # If still too large, resize more aggressively
                if compressed_size > MAX_IMAGE_SIZE_BYTES:
                    logger.warning(f"Image still too large after compression ({compressed_size} bytes), resizing more aggressively")
                    # Resize to 75% of max dimension
                    aggressive_max = int(MAX_IMAGE_DIMENSION * 0.75)
                    ratio = min(aggressive_max / width, aggressive_max / height)
                    new_width = int(width * ratio)
                    new_height = int(height * ratio)
                    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    img.save(temp_path, 'JPEG', quality=75, optimize=True)
                    compressed_size = os.path.getsize(temp_path)
                    logger.info(f"After aggressive resize: {compressed_size} bytes")
                
                return temp_path
                
        except Exception as e:
            logger.error(f"Error compressing image: {str(e)}", exc_info=True)
            # If compression fails, try to use original (may fail API call)
            logger.warning("Compression failed, using original image (may exceed API limit)")
            return image_path

    def encode_image(self, image_path: str) -> str:
        """
        Encode image file to base64 string, compressing if necessary
        
        Args:
            image_path: Path to image file
            
        Returns:
            Base64 encoded image string
        """
        import os
        
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        file_size = os.path.getsize(image_path)
        if file_size == 0:
            raise ValueError(f"Image file is empty: {image_path}")
        
        # Compress image if needed
        compressed_path = self.compress_image(image_path)
        is_temp_file = compressed_path != image_path
        
        try:
            compressed_size = os.path.getsize(compressed_path)
            logger.info(f"Encoding image: {compressed_path} ({compressed_size} bytes)")
            
            with open(compressed_path, "rb") as image_file:
                image_data = image_file.read()
                encoded = base64.b64encode(image_data).decode("utf-8")
                
                # Verify base64 size is under 5 MB
                encoded_size_bytes = len(encoded.encode('utf-8'))
                if encoded_size_bytes > 5_242_880:  # 5 MB
                    raise ValueError(
                        f"Image still too large after compression: "
                        f"{encoded_size_bytes} bytes base64 (limit: 5 MB). "
                        f"Original: {file_size} bytes, Compressed: {compressed_size} bytes"
                    )
                
                logger.info(f"Encoded image to {len(encoded)} characters ({encoded_size_bytes / 1024 / 1024:.2f} MB base64)")
                return encoded
        finally:
            # Clean up temporary compressed file if we created one
            if is_temp_file and os.path.exists(compressed_path):
                try:
                    os.unlink(compressed_path)
                    logger.debug(f"Cleaned up temporary compressed file: {compressed_path}")
                except Exception as e:
                    logger.warning(f"Failed to cleanup temp file {compressed_path}: {e}")

    def get_image_media_type(self, image_path: str) -> str:
        """
        Determine media type from file extension
        
        Args:
            image_path: Path to image file
            
        Returns:
            Media type string (e.g., "image/jpeg", "image/png")
        """
        ext = image_path.lower().split(".")[-1]
        media_types = {
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
            "gif": "image/gif",
            "webp": "image/webp",
        }
        return media_types.get(ext, "image/jpeg")

    def analyze_image(
        self,
        image_paths: list[str],
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 4096,
    ) -> Dict[str, Any]:
        """
        Analyze images using Claude Vision API (supports multiple images)
        
        Args:
            image_paths: List of paths to image files (can be single item)
            prompt: Text prompt for image analysis
            system_prompt: Optional system prompt
            max_tokens: Maximum tokens in response
            
        Returns:
            Dict with analysis results
        """
        try:
            # Prepare content array with all images
            content = []
            
            # Add all images
            for image_path in image_paths:
                image_data = self.encode_image(image_path)
                media_type = self.get_image_media_type(image_path)
                content.append({
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": media_type,
                        "data": image_data,
                    },
                })
            
            # Add text prompt at the end
            content.append({
                "type": "text",
                "text": prompt,
            })
            
            # Prepare messages
            messages = [
                {
                    "role": "user",
                    "content": content,
                }
            ]
            
            # Make API call
            response = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                system=system_prompt,
                messages=messages,
            )
            
            # Extract text content
            text_content = ""
            for content_block in response.content:
                if content_block.type == "text":
                    text_content += content_block.text
            
            return {
                "success": True,
                "text": text_content,
                "usage": {
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens,
                },
            }
        
        except Exception as e:
            logger.error(f"Error analyzing image: {str(e)}")
            return {
                "success": False,
                "error": str(e),
            }

    def stream_image_analysis(
        self,
        image_paths: list[str],
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 4096,
    ):
        """
        Stream image analysis using Claude Vision API (supports multiple images)
        
        Args:
            image_paths: List of paths to image files
            prompt: Text prompt for image analysis
            system_prompt: Optional system prompt
            max_tokens: Maximum tokens in response
            
        Yields:
            Text chunks as they stream in
        """
        try:
            # Prepare content array with all images
            content = []
            
            # Add all images
            for image_path in image_paths:
                image_data = self.encode_image(image_path)
                media_type = self.get_image_media_type(image_path)
                content.append({
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": media_type,
                        "data": image_data,
                    },
                })
            
            # Add text prompt at the end
            content.append({
                "type": "text",
                "text": prompt,
            })
            
            # Prepare messages
            messages = [
                {
                    "role": "user",
                    "content": content,
                }
            ]
            
            # Stream API call
            logger.info(f"Starting Claude Vision API call with {len(image_paths)} images")
            with self.client.messages.stream(
                model=self.model,
                max_tokens=max_tokens,
                system=system_prompt,
                messages=messages,
            ) as stream:
                # The stream object has a text_stream property that yields text chunks
                chunk_count = 0
                for text_chunk in stream.text_stream:
                    chunk_count += 1
                    if chunk_count % 10 == 0:
                        logger.debug(f"Received {chunk_count} chunks so far")
                    yield text_chunk
                logger.info(f"Vision API streaming complete, received {chunk_count} chunks")
        
        except Exception as e:
            logger.error(f"Error streaming image analysis: {str(e)}", exc_info=True)
            raise

