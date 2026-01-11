"""
Claude AI Client Service
Handles all interactions with Anthropic's Claude API
"""

import os
from typing import Optional
from anthropic import Anthropic, APIError

# Initialize Anthropic client
anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))


class ClaudeClient:
    """Client for interacting with Claude 3.5 Sonnet API"""

    def __init__(self):
        self.client = anthropic_client
        # Using Claude Sonnet 4 (latest model)
        self.model = "claude-sonnet-4-20250514"
        self.max_retries = 3
        self.base_delay = 1.0  # Start with 1 second delay

    def stream_completion(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 4096,
    ):
        """
        Stream a completion from Claude API with exponential backoff retry logic
        
        Args:
            prompt: User's input prompt
            system_prompt: Optional system prompt for context
            max_tokens: Maximum tokens in response
            
        Yields:
            Text chunks as they arrive from the API
        """
        delay = self.base_delay
        
        for attempt in range(self.max_retries):
            try:
                # Build messages
                messages = [{"role": "user", "content": prompt}]
                
                # Stream the response (synchronous generator)
                with self.client.messages.stream(
                    model=self.model,
                    max_tokens=max_tokens,
                    messages=messages,
                    system=system_prompt,
                ) as stream:
                    for text_event in stream.text_stream:
                        yield text_event
                
                # Success - break out of retry loop
                break
                
            except APIError as e:
                # Handle rate limits and API errors
                if e.status_code == 429:  # Rate limit
                    if attempt < self.max_retries - 1:
                        wait_time = delay * (2 ** attempt)  # Exponential backoff
                        import time
                        time.sleep(wait_time)
                        delay = min(wait_time * 2, 60)  # Cap at 60 seconds
                        continue
                    else:
                        raise Exception("Rate limit exceeded. Please try again later.")
                elif e.status_code >= 500:  # Server error
                    if attempt < self.max_retries - 1:
                        wait_time = delay * (2 ** attempt)
                        import time
                        time.sleep(wait_time)
                        continue
                    else:
                        raise Exception("Claude API server error. Please try again later.")
                else:
                    # Other API errors - don't retry
                    raise Exception(f"API error: {e.message}")
                    
            except Exception as e:
                if attempt < self.max_retries - 1:
                    wait_time = delay * (2 ** attempt)
                    import time
                    time.sleep(wait_time)
                    continue
                else:
                    raise Exception(f"Error communicating with Claude API: {str(e)}")

    def calculate_confidence(self, response_text: str) -> str:
        """
        Calculate confidence level (High/Med/Low) based on response characteristics
        
        Args:
            response_text: The AI-generated response
            
        Returns:
            Confidence level: "High", "Med", or "Low"
        """
        if not response_text or len(response_text.strip()) < 10:
            return "Low"
        
        # Check for uncertainty indicators
        uncertainty_words = [
            "might", "maybe", "perhaps", "possibly", "uncertain", 
            "unclear", "not sure", "could be", "seems", "appears"
        ]
        uncertainty_count = sum(
            1 for word in uncertainty_words 
            if word.lower() in response_text.lower()
        )
        
        # Check for qualifiers
        qualifier_phrases = [
            "I think", "I believe", "in my opinion", "it seems",
            "it appears", "probably", "likely"
        ]
        qualifier_count = sum(
            1 for phrase in qualifier_phrases 
            if phrase.lower() in response_text.lower()
        )
        
        # Calculate score (lower is more confident)
        uncertainty_score = uncertainty_count + qualifier_count
        
        # Determine confidence level
        if uncertainty_score == 0 and len(response_text) > 100:
            return "High"
        elif uncertainty_score <= 2:
            return "Med"
        else:
            return "Low"

