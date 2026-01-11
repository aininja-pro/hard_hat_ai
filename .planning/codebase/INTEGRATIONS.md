# External Integrations

**Analysis Date:** 2026-01-11

## APIs & External Services

**AI/LLM Processing:**
- Anthropic Claude API - Primary AI provider for all agents
  - SDK/Client: `anthropic` npm package v0.7.7 - `backend/app/services/claude_client.py`
  - Model: Claude 3 Opus (claude-3-opus-20240229), Claude 3.5 Sonnet available
  - Auth: Bearer token via `ANTHROPIC_API_KEY` env var
  - Features: Streaming responses, exponential backoff retry (3 max retries), rate limit handling (429), confidence scoring
  - Endpoints: Text completion, Vision API for image analysis

**Email/SMS:**
- Not applicable - No email/SMS integrations

**External APIs:**
- Claude Vision API - Multi-image analysis for Lookahead Builder
  - Integration: `backend/app/services/vision_client.py`
  - Auth: Same `ANTHROPIC_API_KEY`
  - Features: Intelligent image compression (max 2048px, 3.75MB raw), Base64 encoding (5MB limit)
  - Supports: JPEG, PNG, GIF, WebP formats

## Data Storage

**Databases:**
- None - Zero data retention architecture
  - All processing is ephemeral
  - No user data stored on server
  - Temp files auto-deleted after request

**File Storage:**
- Temporary local storage only
  - Context manager: `backend/app/utils/file_cleanup.py` - `TemporaryFile` class
  - Auto-cleanup on request completion
  - No cloud storage integration

**Caching:**
- PWA Workbox caching for static assets - `frontend/vite.config.ts`
  - Supabase API responses cached 24 hours
  - Shell assets cached (JS, CSS, HTML, images)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Passwordless magic link authentication
  - Implementation: `frontend/src/lib/supabase.ts`, `frontend/src/contexts/AuthContext.tsx`
  - Token storage: localStorage with auto-refresh
  - Session management: 24-hour session expiry, JWT refresh tokens
  - Features: `autoRefreshToken: true`, `persistSession: true`

**OAuth Integrations:**
- Not currently implemented (magic links only)

## Monitoring & Observability

**Error Tracking:**
- None configured
- Console logging in development mode

**Analytics:**
- None configured

**Logs:**
- Python `logging` module - Backend
- `console.log` - Frontend development
- No external log aggregation

## CI/CD & Deployment

**Hosting:**
- Docker container support - `backend/Dockerfile`, `docker-compose.yml`
- Health check endpoint: `GET /health`
- No specific cloud provider configured

**CI Pipeline:**
- Not detected
- No GitHub Actions workflows found

## Environment Configuration

**Development:**
- Required frontend env vars:
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- Required backend env vars:
  - `ANTHROPIC_API_KEY` - Claude API access
- Optional vars:
  - `VITE_API_URL` - Override backend URL (auto-detected by default)
  - `CORS_ORIGINS` - Allowed frontend URLs
- Secrets location: `.env.local` (frontend), `.env` (backend) - both gitignored

**Staging:**
- Not explicitly configured
- Same env vars apply

**Production:**
- Environment vars: Same as development
- CORS: Configure `CORS_ORIGINS` for production domains
- No secrets management system detected (relies on env vars)

## Webhooks & Callbacks

**Incoming:**
- Supabase Auth callback - `frontend/src/pages/AuthCallback.tsx`
  - Handles magic link redirect
  - Exchanges URL hash for session tokens
  - No signature verification (handled by Supabase SDK)

**Outgoing:**
- None

## API Communication Patterns

**Server-Sent Events (SSE):**
- Primary communication pattern for AI responses
- Frontend hooks: `frontend/src/hooks/useClaudeStream.ts`, `frontend/src/hooks/useClaudeStreamFormData.ts`
- Agent-specific hooks:
  - `frontend/src/hooks/useContractHawkStream.ts`
  - `frontend/src/hooks/useLookaheadBuilderStream.ts`
  - `frontend/src/hooks/useSubmittalScrubberStream.ts`
- Features: Citation tracking, confidence scoring, progress updates

**API URL Detection:**
- Auto-configured in `frontend/src/utils/apiConfig.ts`
- Localhost detection for development
- IP-based detection for mobile testing (same network)
- Fallback to localhost:8000

## File Processing

**PDF Processing:**
- PyMuPDF (fitz) - `backend/app/services/pdf_processor.py`
- Features: Text extraction with page citations, metadata extraction, validation
- Limits: Max 25MB, 100 pages per file

**Export Generation:**
- jsPDF + jspdf-autotable - PDF report generation
  - `frontend/src/utils/exportRiskTable.ts`
  - `frontend/src/utils/exportSchedule.ts`
  - `frontend/src/utils/exportComplianceTable.ts`
- XLSX (SheetJS) - Excel export
  - `frontend/src/utils/exportWithCitations.ts`
  - Multiple sheet support, custom formatting

---

*Integration audit: 2026-01-11*
*Update when adding/removing external services*
