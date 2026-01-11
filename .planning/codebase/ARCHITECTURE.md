# Architecture

**Analysis Date:** 2026-01-11

## Pattern Overview

**Overall:** Full-Stack AI-Powered Web Application with Multi-Agent System

**Key Characteristics:**
- Layered monolithic architecture with clear separation of concerns
- Real-time streaming via Server-Sent Events (SSE)
- Zero data retention (ephemeral processing)
- PWA-enabled frontend for mobile/offline support
- Modular agent pattern (self-contained feature modules)

## Layers

**Presentation Layer (Frontend):**
- Purpose: User interface and interaction handling
- Contains: React components, pages, styling
- Location: `frontend/src/pages/`, `frontend/src/components/`, `frontend/src/features/`
- Depends on: API Integration Layer
- Used by: End users via browser

**API Integration Layer (Frontend):**
- Purpose: Manage HTTP requests and streaming responses
- Contains: Custom hooks for SSE streaming, Supabase client
- Location: `frontend/src/hooks/`, `frontend/src/lib/`
- Depends on: Backend API
- Used by: Presentation Layer

**Router Layer (Backend):**
- Purpose: HTTP endpoint handling and request orchestration
- Contains: FastAPI route handlers, one per agent
- Location: `backend/app/routers/`
- Depends on: Service Layer, Model Layer
- Used by: Frontend via HTTP/SSE

**Service Layer (Backend):**
- Purpose: Core business logic and external API integration
- Contains: Claude client, PDF processor, Vision client
- Location: `backend/app/services/`
- Depends on: External APIs (Anthropic), file system
- Used by: Router Layer

**Model Layer (Backend):**
- Purpose: Data validation and type safety
- Contains: Pydantic request/response models
- Location: `backend/app/models/`
- Depends on: Pydantic library
- Used by: Router Layer

**Middleware Layer (Backend):**
- Purpose: Cross-cutting concerns (CORS, validation)
- Contains: File validation, CORS configuration
- Location: `backend/app/middleware/`
- Depends on: FastAPI middleware system
- Used by: Router Layer

## Data Flow

**AI Agent Processing Flow:**

1. User submits data (text or file upload) via React UI
2. Frontend hook creates FormData or JSON payload
3. HTTP POST to `/api/{agent-name}/{action}`
4. FastAPI router validates input (middleware)
5. Router calls service layer (PDF extraction, image processing)
6. Service layer calls Claude API with system + user prompt
7. Claude streams response chunks
8. Router yields SSE format: `data: {"type": "text", "chunk": "..."}\n\n`
9. Frontend hook parses SSE, accumulates chunks
10. UI updates in real-time
11. Final SSE message: `data: {"type": "complete", "confidence": "High", ...}\n\n`
12. Temp files auto-deleted via context manager

**Authentication Flow (Magic Link):**

1. User enters email on SignIn page
2. `AuthContext.signIn()` calls `supabase.auth.signInWithOtp()`
3. Supabase sends magic link email
4. User clicks link, redirected to `/auth/callback`
5. `AuthCallback.tsx` extracts session from URL hash
6. Session stored in localStorage
7. Protected routes unlock

**State Management:**
- React Context for auth state (`AuthContext`)
- React Context for theme (`ThemeContext`)
- Local component state for form data and UI state
- No global state management library (Redux, Zustand)

## Key Abstractions

**Agent:**
- Purpose: Self-contained AI feature module
- Examples: Contract Hawk, Site Scribe, Submittal Scrubber, Lookahead Builder
- Pattern: Each agent has: Page component, streaming hook, router, models
- Locations:
  - `frontend/src/features/{agent-name}/`
  - `frontend/src/hooks/use{AgentName}Stream.ts`
  - `backend/app/routers/{agent_name}.py`
  - `backend/app/models/{agent_name}.py`

**Streaming Hook:**
- Purpose: Manage SSE connection and response parsing
- Examples: `useClaudeStream`, `useContractHawkStream`, `useLookaheadBuilderStream`
- Pattern: Returns `{ response, isLoading, error, confidence, streamResponse, reset }`
- Location: `frontend/src/hooks/`

**Service:**
- Purpose: Encapsulate external API calls and processing
- Examples: `ClaudeClient`, `PDFProcessor`, `VisionClient`
- Pattern: Class-based with static methods or singleton instances
- Location: `backend/app/services/`

**Temporary File:**
- Purpose: Auto-cleanup file handling
- Example: `TemporaryFile` context manager
- Pattern: `with TemporaryFile(...) as path:` - deletes on exit
- Location: `backend/app/utils/file_cleanup.py`

## Entry Points

**Frontend Entry:**
- Location: `frontend/src/main.tsx`
- Triggers: Browser loads app
- Responsibilities: Render React app with BrowserRouter

**Backend Entry:**
- Location: `backend/app/main.py`
- Triggers: `uvicorn app.main:app --reload`
- Responsibilities: Initialize FastAPI, register routers, configure CORS

**Router Registration:**
```python
app.include_router(health.router)
app.include_router(site_scribe.router)
app.include_router(contract_hawk.router)
app.include_router(submittal_scrubber.router)
app.include_router(code_commander.router)
app.include_router(lookahead_builder.router)
```

## Error Handling

**Strategy:** Throw errors, catch at boundaries, stream error messages

**Frontend Patterns:**
- try/catch in streaming hooks
- Error state returned from hooks: `{ error: string | null }`
- UI displays error messages with retry options

**Backend Patterns:**
- HTTPException for client errors (400, 404)
- Exception handlers in routers
- SSE error message: `data: {"type": "error", "message": "..."}\n\n`
- Logging at service layer boundaries

## Cross-Cutting Concerns

**Logging:**
- Backend: Python `logging` module
- Frontend: `console.log` in development
- Pattern: Log at service boundaries and errors

**Validation:**
- Frontend: `frontend/src/utils/fileValidation.ts` - client-side file checks
- Backend: `backend/app/middleware/file_validation.py` - server-side validation
- Backend: Pydantic models for request/response validation

**Authentication:**
- Supabase Auth via `frontend/src/contexts/AuthContext.tsx`
- Protected routes via `frontend/src/components/ProtectedRoute.tsx`
- No backend auth verification (frontend handles all auth)

**File Operations:**
- `TemporaryFile` context manager for auto-cleanup
- PDF validation: size limits (25MB), page limits (100)
- Image validation: size limits (10MB), format checks

**Theming:**
- CSS variables in `frontend/src/styles/index.css`
- Theme context: `frontend/src/contexts/ThemeContext.tsx`
- Field mode (high contrast) and Office mode variants

---

*Architecture analysis: 2026-01-11*
*Update when major patterns change*
