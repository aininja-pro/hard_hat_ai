# Codebase Concerns

**Analysis Date:** 2026-01-11

## Tech Debt

**Large Functions Exceeding 200 Lines:**
- Issue: Several routers contain very large streaming generator functions
- Files:
  - `backend/app/routers/submittal_scrubber.py` (463 lines) - JSON parsing with 9 nested try-catch blocks
  - `backend/app/routers/lookahead_builder.py` (443 lines) - Complex image handling and progress management
  - `backend/app/routers/contract_hawk.py` (438 lines) - Streaming generator with background task management
  - `frontend/src/features/lookahead-builder/LookaheadBuilderPage.tsx` (344 lines) - Complex state management
  - `frontend/src/features/site-scribe/SiteScribePage.tsx` (293 lines) - Mixed concerns
- Why: Rapid development, features added incrementally
- Impact: Hard to test, maintain, and debug
- Fix approach: Extract streaming logic to shared utility; extract JSON parsing to dedicated service

**Duplicate Streaming Hook Code:**
- Issue: 5 hooks implement nearly identical SSE parsing logic
- Files:
  - `frontend/src/hooks/useClaudeStream.ts` (104 lines)
  - `frontend/src/hooks/useClaudeStreamFormData.ts` (125 lines)
  - `frontend/src/hooks/useContractHawkStream.ts` (137 lines)
  - `frontend/src/hooks/useLookaheadBuilderStream.ts` (138 lines)
  - `frontend/src/hooks/useSubmittalScrubberStream.ts` (similar)
- Why: Each agent added ad-hoc without abstraction
- Impact: Bug fixes need to be applied 5 times; inconsistent behavior
- Fix approach: Create base streaming hook factory with configuration for agent-specific behavior

**Complex JSON Parsing with Fragile Fallbacks:**
- Issue: Multiple strategies for extracting JSON from Claude responses, manual brace counting
- Files:
  - `backend/app/routers/submittal_scrubber.py` lines 108-325
  - `backend/app/routers/contract_hawk.py` lines 209-260
- Why: Claude responses can vary in format
- Impact: Silent failures, partial/corrupted data if parsing fails mid-stream
- Fix approach: Use JSON decoder with lenient mode or streaming JSON parser

## Known Bugs

**No Critical Bugs Detected**

Minor issues to monitor:
- Console.log statements in auth flow could expose sensitive data in production browser console
- No immediate functional bugs identified

## Security Considerations

**Excessive Logging of Sensitive Data:**
- Risk: Auth flow logs email, redirect URLs, and response data to browser console
- Files:
  - `frontend/src/contexts/AuthContext.tsx` lines 55-79
  - `frontend/src/pages/AuthCallback.tsx` lines 19-42
- Current mitigation: Only runs in browser console (not sent anywhere)
- Recommendations: Remove console.log statements from production builds; use conditional `import.meta.env.DEV` checks

**Missing .env.example Files:**
- Risk: New developers won't know required environment variables
- Files:
  - `backend/.env.example` - Does not exist
  - `frontend/.env.example` - Does not exist
- Current mitigation: Some env vars documented in README
- Recommendations: Create `.env.example` files with placeholder values

**Path Traversal Protection - WELL IMPLEMENTED:**
- `frontend/src/utils/fileValidation.ts` lines 122-130 - Checks for `..`, `/`, `\` in filenames
- `backend/app/middleware/file_validation.py` lines 72-78 - Server-side validation
- No hardcoded secrets in code (using env vars correctly)
- No `dangerouslySetInnerHTML` or `eval()` found

## Performance Bottlenecks

**Image Loading Memory Usage:**
- Problem: Loop over image files loads each entirely into memory
- File: `backend/app/routers/lookahead_builder.py` lines 269-292
- Measurement: 5 images at 10MB each = 50MB RAM per request
- Cause: `validate_uploaded_file()` reads entire file
- Improvement path: Use streaming validation; limit concurrent image count

**Token Limiting Without Calculation:**
- Problem: Hard-coded character limits without actual token counting
- Files:
  - `backend/app/routers/submittal_scrubber.py` line 100 - 35k char limit
  - `backend/app/routers/code_commander.py` line 154 - 50k char limit
- Measurement: Not measured
- Cause: Simplistic truncation approach
- Improvement path: Use tiktoken for accurate token counting; adaptive truncation

## Fragile Areas

**JSON Parsing in Routers:**
- Why fragile: Multiple nested try-catch blocks with manual brace matching
- Files: `backend/app/routers/submittal_scrubber.py` lines 118-325
- Common failures: Claude returns incomplete JSON, parsing returns empty results
- Safe modification: Add comprehensive unit tests before changing
- Test coverage: No tests

**Streaming Generator Functions:**
- Why fragile: Background asyncio tasks with complex state management
- File: `backend/app/routers/contract_hawk.py` lines 318-438
- Common failures: Race conditions between progress updates and streaming
- Safe modification: Extract to separate module with tests
- Test coverage: No tests

## Scaling Limits

**Zero Data Retention Architecture:**
- Current capacity: All processing is ephemeral, no state persistence
- Limit: Cannot implement features requiring history (user preferences, previous analyses)
- Symptoms at limit: Would need to re-upload files each time
- Scaling path: Add optional database (Supabase) for persistence if needed

## Dependencies at Risk

**Outdated Python Dependencies:**
- `anthropic==0.7.7` (current: 0.38+) - Missing critical API improvements
- `fastapi==0.104.1` (current: 0.109+)
- `uvicorn==0.24.0` (current: 0.27+)
- `pydantic==2.5.0` (current: 2.6+)
- Risk: Security patches missing, API changes not available
- Migration plan: Run `pip list --outdated` and update dependencies

**Outdated Frontend Dependencies:**
- `@supabase/supabase-js@^2.38.4` (current: 2.39+)
- `react@^18.2.0` (current: 18.3+)
- `pdfjs-dist@^3.11.174` (current: 4.0+)
- Risk: Minor security and feature updates
- Migration plan: Run `npm outdated` and `npm audit`

## Missing Critical Features

**No Test Suite:**
- Problem: Zero automated tests in codebase
- Current workaround: Manual testing via browser and FastAPI docs
- Blocks: Confident refactoring, catching regressions
- Implementation complexity: Medium (setup framework, write critical path tests)

**No Backend Linting/Formatting:**
- Problem: Python code has no automated formatting or linting
- Current workaround: Manual code review
- Blocks: Consistent code style, catching common errors
- Implementation complexity: Low (add black, flake8, mypy)

## Test Coverage Gaps

**Entire Codebase Untested:**
- What's not tested: Everything
- Risk: Breaking changes undetected, regressions in production
- Priority: High
- Difficulty to test: Medium (need to set up Vitest + pytest)

**Critical Code Needing Tests First:**
1. `backend/app/services/pdf_processor.py` - PDF validation and extraction
2. `backend/app/middleware/file_validation.py` - Path traversal, file type checks
3. `frontend/src/utils/fileValidation.ts` - Client-side validation
4. `frontend/src/contexts/AuthContext.tsx` - Auth state management
5. JSON parsing in routers - Ensure graceful failure handling

## Production Readiness Issues

**Bare Exception Handlers:**
- Issue: `except: pass` swallows all exceptions including KeyboardInterrupt
- File: `backend/app/routers/lookahead_builder.py` lines 297-298, 303-304
- Fix: Change to `except Exception as e: logger.error(...)`

**Logger Created Inside Functions:**
- Issue: Logger should be module-level, not per-function
- Files:
  - `backend/app/routers/submittal_scrubber.py` line 251
  - `backend/app/routers/contract_hawk.py` line 312
- Fix: Move `logger = logging.getLogger(__name__)` to module top

**Unbounded Queue:**
- Issue: `deque()` for progress messages has no max size
- File: `backend/app/routers/contract_hawk.py` line 348
- Risk: Memory leak if messages accumulate
- Fix: Use `deque(maxlen=50)` or similar bounded size

## Quick Wins (Highest Priority)

1. **Create `.env.example` files** - Unblock new developers (30 min)
2. **Remove console.log from auth flow** - `AuthContext.tsx` lines 55-79 (15 min)
3. **Fix bare `except: pass`** - `lookahead_builder.py` lines 297-298, 303-304 (10 min)
4. **Move logger to module level** - Multiple files (15 min)
5. **Add pytest and Vitest setup** - Enable future test writing (1-2 hrs)

---

*Concerns audit: 2026-01-11*
*Update as issues are fixed or new ones discovered*
