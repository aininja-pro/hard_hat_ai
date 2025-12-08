# Hard Hat AI Pack - Implementation Plan

## Project Overview
White-label PWA for construction professionals with 5 AI agents, built with React + Tailwind (frontend), FastAPI (backend), and Claude 3.5 Sonnet + Vision (AI).

**Location**: `/Users/richardrierson/Desktop/Projects/HardHat/`
**Auth**: Supabase Auth (magic-link)
**Hosting**: Vercel (frontend) + Railway/Render (backend)

---

## Phase 1: Foundation
*Build the base that everything else depends on.*

### 1.1 Project Setup
- Initialize monorepo structure:
  ```
  /frontend    - React + Vite + Tailwind PWA
  /backend     - FastAPI + Docker
  ```
- Create `package.json`, `requirements.txt`, Docker configs
- Set up ESLint, Prettier, pre-commit hooks

**Key Files to Create:**
- `/frontend/package.json`
- `/frontend/vite.config.ts`
- `/frontend/tailwind.config.js`
- `/frontend/src/main.tsx`
- `/backend/requirements.txt`
- `/backend/app/main.py`
- `/backend/Dockerfile`
- `/docker-compose.yml`

### 1.2 Authentication (Supabase)
- Supabase project setup
- Magic-link email flow
- Session management (24-hour persistence)
- Protected route wrapper
- Auth context/hooks

**Key Files:**
- `/frontend/src/lib/supabase.ts`
- `/frontend/src/contexts/AuthContext.tsx`
- `/frontend/src/hooks/useAuth.ts`
- `/frontend/src/components/ProtectedRoute.tsx`
- `/frontend/src/pages/SignIn.tsx`

### 1.3 Dashboard Skeleton
- Responsive layout with header
- 5 agent cards (placeholders)
- Liability disclaimer modal (mandatory each session)
- Field/Office mode toggle with persistence
- White-label theming system (env vars)

**Key Files:**
- `/frontend/src/pages/Dashboard.tsx`
- `/frontend/src/components/AgentCard.tsx`
- `/frontend/src/components/LiabilityModal.tsx`
- `/frontend/src/components/ModeToggle.tsx`
- `/frontend/src/contexts/ThemeContext.tsx`
- `/frontend/src/styles/themes.css`

---

## Phase 2: Site Scribe (Simplest Agent)
*Establish AI integration patterns with the simplest agent.*

### Why First
- Text input only (no file uploads)
- Simple output (email text)
- Establishes Claude API pattern
- Voice can be added later

### What to Build
- Claude API client with streaming
- Text input component
- Streaming response display
- Confidence indicator (High/Med/Low)
- Export: clipboard, mailto
- Tone selector (Neutral/Firm/CYA)
- Web Speech API integration (voice input)

**Key Files:**
- `/backend/app/routers/site_scribe.py`
- `/backend/app/services/claude_client.py`
- `/frontend/src/features/site-scribe/SiteScribePage.tsx`
- `/frontend/src/features/site-scribe/components/ToneSelector.tsx`
- `/frontend/src/components/StreamingResponse.tsx`
- `/frontend/src/components/ConfidenceBadge.tsx`
- `/frontend/src/components/VoiceInput.tsx`
- `/frontend/src/hooks/useClaudeStream.ts`
- `/frontend/src/utils/exports.ts`

---

## Phase 3: File Processing Infrastructure
*Build file handling before agents that need it.*

### What to Build
- Client-side validation (PDF ≤25MB/100 pages, images ≤10MB)
- File upload component with progress
- Backend PDF processing (PyMuPDF)
- Text extraction pipeline
- Security controls (sanitization)
- Zero data retention (auto-cleanup)

**Key Files:**
- `/frontend/src/components/FileUpload.tsx`
- `/frontend/src/utils/fileValidation.ts`
- `/backend/app/services/pdf_processor.py`
- `/backend/app/utils/file_cleanup.py`
- `/backend/app/middleware/file_validation.py`

---

## Phase 4: PDF-Based Agents
*Build agents that use PDFs but don't require images.*

### 4.1 Code & Spec Commander
- PDF upload + question input
- Text extraction from PDF
- Claude query with document context
- Answer with page/section citations
- Export: clipboard

**Key Files:**
- `/backend/app/routers/code_commander.py`
- `/frontend/src/features/code-commander/CodeCommanderPage.tsx`
- `/frontend/src/components/CitationDisplay.tsx`

### 4.2 Contract Hawk
- PDF upload
- Risk analysis prompt to Claude
- Table output (clause, severity 1-5, plain English)
- Export: clipboard, Excel, PDF

**Key Files:**
- `/backend/app/routers/contract_hawk.py`
- `/frontend/src/features/contract-hawk/ContractHawkPage.tsx`
- `/frontend/src/components/RiskTable.tsx`

---

## Phase 5: Dual-PDF Agent

### Submittal Scrubber
- Two PDF uploads (spec file + product data)
- Comparison logic
- Compliance table (requirement, spec text, product text, pass/warn/fail)
- Export: Excel

**Key Files:**
- `/backend/app/routers/submittal_scrubber.py`
- `/frontend/src/features/submittal-scrubber/SubmittalScrubberPage.tsx`
- `/frontend/src/components/DualFileUpload.tsx`
- `/frontend/src/components/ComplianceTable.tsx`

---

## Phase 6: Lookahead Builder (Most Complex)
*Save for last - benefits from all previous patterns.*

### Why Last
By this point we'll have:
- Working AI integration pattern
- File upload system
- Streaming responses
- Table generation/export
- Confidence indicators

### What to Build
- Image upload with preview (≤10MB)
- Claude Vision integration
- Multimodal prompt (image + text)
- 2-week schedule table output (Date, Task, Crew, Materials)
- Streaming table rendering
- Export: clipboard, Excel

**Key Files:**
- `/backend/app/routers/lookahead_builder.py`
- `/backend/app/services/vision_client.py`
- `/frontend/src/features/lookahead-builder/LookaheadBuilderPage.tsx`
- `/frontend/src/components/ImageUpload.tsx`
- `/frontend/src/components/ScheduleTable.tsx`

### Technical Challenges
1. Claude Vision API for image analysis
2. Structured JSON output from unstructured image
3. Combining image + text context
4. Progressive table rendering
5. Handling ambiguous/blurry photos

---

## Folder Structure (Final)

```
/HardHat
├── /frontend
│   ├── /public
│   │   └── manifest.json
│   ├── /src
│   │   ├── /components        # Shared UI components
│   │   ├── /contexts          # Auth, Theme, Mode contexts
│   │   ├── /features          # Agent-specific folders
│   │   │   ├── /site-scribe
│   │   │   ├── /lookahead-builder
│   │   │   ├── /code-commander
│   │   │   ├── /contract-hawk
│   │   │   └── /submittal-scrubber
│   │   ├── /hooks             # Custom React hooks
│   │   ├── /lib               # Supabase, API clients
│   │   ├── /pages             # Route pages
│   │   ├── /styles            # Global styles, themes
│   │   └── /utils             # Helpers, exports, validation
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── /backend
│   ├── /app
│   │   ├── /routers           # API endpoints per agent
│   │   ├── /services          # Claude client, PDF processor
│   │   ├── /models            # Pydantic schemas
│   │   ├── /middleware        # CORS, auth, validation
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── /documentation             # Existing docs
├── docker-compose.yml
└── README.md
```

---

## Build Order Summary

```
Foundation
├── Project Setup
├── Authentication (Supabase)
└── Dashboard + Theming

First Agent (Simple)
└── Site Scribe (text → email)

File Infrastructure
└── PDF Processing + Validation

PDF-Based Agents
├── Code & Spec Commander
└── Contract Hawk

Dual-PDF Agent
└── Submittal Scrubber

Complex Agent (Last)
└── Lookahead Builder (image + text → schedule)
```

---

## Benefits of This Approach

1. **Early wins** - Working agent quickly (Site Scribe)
2. **Pattern reuse** - Each agent builds on previous ones
3. **Incremental complexity** - Add one new concept at a time
4. **Easier debugging** - Isolate issues to one area
5. **Confidence building** - Learn patterns before tackling hardest part

---

## Key Technical Requirements

| Requirement | Detail |
|-------------|--------|
| Zero data retention | Discard files after processing |
| Load time | Sub-3 seconds on 4G mobile |
| Touch targets | 44px+ in Field Mode |
| PDF limits | ≤25MB, ≤100 pages |
| Image limits | ≤10MB |
| Session | 24-hour persistence via Supabase |
| Theming | White-label via env vars (logo, colors, favicon) |
