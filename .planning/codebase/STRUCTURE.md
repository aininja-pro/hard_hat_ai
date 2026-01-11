# Codebase Structure

**Analysis Date:** 2026-01-11

## Directory Layout

```
HardHat/
├── backend/                    # Python FastAPI backend
│   ├── app/                   # Application code
│   │   ├── main.py           # FastAPI entry point
│   │   ├── routers/          # API endpoints (one per agent)
│   │   ├── models/           # Pydantic request/response models
│   │   ├── services/         # Business logic (Claude, PDF, Vision)
│   │   ├── middleware/       # CORS, file validation
│   │   └── utils/            # Utilities (file cleanup)
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile            # Multi-stage Docker build
│   └── .env                  # Environment variables (gitignored)
├── frontend/                  # React TypeScript frontend
│   ├── src/                  # Source code
│   │   ├── main.tsx         # Vite entry point
│   │   ├── App.tsx          # Router configuration
│   │   ├── pages/           # Top-level page containers
│   │   ├── features/        # AI agent feature modules
│   │   ├── components/      # Shared UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React Context providers
│   │   ├── lib/             # External library setup
│   │   ├── utils/           # Utility functions
│   │   └── styles/          # Global CSS
│   ├── public/              # Static assets
│   ├── package.json         # Node dependencies
│   ├── vite.config.ts       # Vite + PWA config
│   ├── tsconfig.json        # TypeScript config
│   └── .env.local           # Frontend env vars (gitignored)
├── documentation/            # Project documentation
├── docker-compose.yml        # Docker orchestration
└── README.md                 # Project overview
```

## Directory Purposes

**backend/app/routers/**
- Purpose: HTTP endpoint handlers, one file per AI agent
- Contains: FastAPI router definitions with streaming responses
- Key files:
  - `health.py` - Health check endpoint
  - `site_scribe.py` - Text to email transformation
  - `contract_hawk.py` - Contract risk analysis
  - `submittal_scrubber.py` - Spec compliance checking
  - `code_commander.py` - Technical document search
  - `lookahead_builder.py` - Schedule generation
  - `file_test.py` - Development test endpoint
- Subdirectories: None

**backend/app/models/**
- Purpose: Pydantic models for request/response validation
- Contains: Data classes with Field validators
- Key files:
  - `site_scribe.py` - SiteScribeRequest, SiteScribeResponse
  - `contract_hawk.py` - RiskItem, ContractHawkResponse
  - `submittal_scrubber.py` - ComplianceItem, SubmittalResponse
  - `code_commander.py` - CodeSearchRequest, CodeSearchResponse
  - `lookahead_builder.py` - ScheduleRequest, ScheduleResponse
- Subdirectories: None

**backend/app/services/**
- Purpose: Core business logic and external API integration
- Contains: Service classes for Claude, PDF processing, Vision
- Key files:
  - `claude_client.py` - Claude API streaming, confidence calculation
  - `pdf_processor.py` - PDF validation, text extraction
  - `vision_client.py` - Image processing for Claude Vision API
- Subdirectories: None

**backend/app/middleware/**
- Purpose: Request processing middleware
- Contains: CORS configuration, file validation
- Key files:
  - `cors.py` - Dynamic CORS origin handling
  - `file_validation.py` - File type, size, security checks
- Subdirectories: None

**frontend/src/pages/**
- Purpose: Top-level page containers (route handlers)
- Contains: Page components for each route
- Key files:
  - `Dashboard.tsx` - Agent selection hub
  - `SignIn.tsx` - Magic link authentication
  - `AuthCallback.tsx` - OAuth callback handler
  - `FileTestPage.tsx` - Development testing
- Subdirectories: None

**frontend/src/features/**
- Purpose: Self-contained AI agent feature modules
- Contains: Agent-specific pages and components
- Key files:
  - `site-scribe/SiteScribePage.tsx`
  - `contract-hawk/ContractHawkPage.tsx`
  - `submittal-scrubber/SubmittalScrubberPage.tsx`
  - `code-commander/CodeCommanderPage.tsx`
  - `lookahead-builder/LookaheadBuilderPage.tsx`
- Subdirectories: One per agent (kebab-case)

**frontend/src/components/**
- Purpose: Shared UI components
- Contains: Reusable React components
- Key files:
  - `FileUpload.tsx` - File input with validation
  - `DualFileUpload.tsx` - Two-file upload for comparison
  - `MultiImageUpload.tsx` - Batch image upload
  - `StreamingResponse.tsx` - Real-time text display
  - `RiskTable.tsx` - Contract risks table
  - `ComplianceTable.tsx` - Submittal compliance table
  - `ScheduleTable.tsx` - Lookahead schedule table
  - `ProgressIndicator.tsx` - Loading/progress UI
  - `ConfidenceBadge.tsx` - AI confidence indicator
  - `CitationDisplay.tsx` - Source citations
  - `ProtectedRoute.tsx` - Auth guard wrapper
  - `ModeToggle.tsx` - Dark/light theme switch
  - `AgentCard.tsx` - Dashboard agent card
- Subdirectories: None

**frontend/src/hooks/**
- Purpose: Custom React hooks for streaming and data
- Contains: SSE streaming hooks, auth hook
- Key files:
  - `useClaudeStream.ts` - Generic SSE streaming (JSON body)
  - `useClaudeStreamFormData.ts` - SSE streaming (FormData)
  - `useContractHawkStream.ts` - Contract Hawk specific
  - `useLookaheadBuilderStream.ts` - Lookahead Builder specific
  - `useSubmittalScrubberStream.ts` - Submittal Scrubber specific
  - `useAuth.ts` - Auth context hook
- Subdirectories: None

**frontend/src/contexts/**
- Purpose: React Context providers for global state
- Contains: Auth and theme contexts
- Key files:
  - `AuthContext.tsx` - Supabase auth state management
  - `ThemeContext.tsx` - Dark/light theme state
- Subdirectories: None

**frontend/src/utils/**
- Purpose: Utility functions
- Contains: File validation, exports, API config
- Key files:
  - `apiConfig.ts` - Backend URL auto-detection
  - `fileValidation.ts` - Client-side file checks
  - `themeConfig.ts` - Theme configuration
  - `exportRiskTable.ts` - Excel/PDF export for risks
  - `exportSchedule.ts` - Excel export for schedules
  - `exportComplianceTable.ts` - Excel export for compliance
  - `exportWithCitations.ts` - Export with source references
  - `exports.ts` - Generic export utilities
- Subdirectories: None

## Key File Locations

**Entry Points:**
- `frontend/src/main.tsx` - Vite/React entry point
- `backend/app/main.py` - FastAPI application entry

**Configuration:**
- `frontend/vite.config.ts` - Vite + PWA configuration
- `frontend/tsconfig.json` - TypeScript compiler options
- `frontend/.prettierrc` - Code formatting rules
- `frontend/.eslintrc.cjs` - Linting configuration
- `backend/requirements.txt` - Python dependencies
- `docker-compose.yml` - Docker orchestration

**Core Logic:**
- `backend/app/services/claude_client.py` - AI API integration
- `backend/app/services/pdf_processor.py` - PDF text extraction
- `frontend/src/hooks/useClaudeStream.ts` - SSE streaming
- `frontend/src/contexts/AuthContext.tsx` - Authentication

**Testing:**
- No test files currently (tests not implemented)

**Documentation:**
- `README.md` - Project overview
- `documentation/` - Additional project docs
- `frontend/CLAUDE.md` - Claude Code instructions

## Naming Conventions

**Files:**
- PascalCase.tsx - React components (`FileUpload.tsx`, `RiskTable.tsx`)
- camelCase.ts - Utilities, hooks (`apiConfig.ts`, `useAuth.ts`)
- snake_case.py - Python modules (`claude_client.py`, `pdf_processor.py`)
- UPPERCASE.md - Important docs (`README.md`, `CLAUDE.md`)

**Directories:**
- kebab-case - Feature directories (`contract-hawk/`, `site-scribe/`)
- lowercase - Module directories (`components/`, `hooks/`, `routers/`)
- Plural names for collections (`pages/`, `services/`, `models/`)

**Special Patterns:**
- `use{Name}.ts` - Custom React hooks
- `{AgentName}Page.tsx` - Agent page components
- `{name}_router.py` or `{name}.py` - FastAPI routers
- `export{Name}.ts` - Export utility functions

## Where to Add New Code

**New AI Agent:**
- Frontend page: `frontend/src/features/{agent-name}/{AgentName}Page.tsx`
- Streaming hook: `frontend/src/hooks/use{AgentName}Stream.ts`
- Backend router: `backend/app/routers/{agent_name}.py`
- Backend models: `backend/app/models/{agent_name}.py`
- Register router: `backend/app/main.py`
- Add route: `frontend/src/App.tsx`

**New Shared Component:**
- Implementation: `frontend/src/components/{ComponentName}.tsx`
- Export from component or use directly

**New Utility Function:**
- Frontend: `frontend/src/utils/{utilName}.ts`
- Backend: `backend/app/utils/{util_name}.py`

**New API Endpoint:**
- Add to existing router or create new in `backend/app/routers/`
- Register in `backend/app/main.py` if new router

## Special Directories

**frontend/public/**
- Purpose: Static assets served directly
- Source: PWA icons, favicon, robots.txt
- Committed: Yes

**backend/app/utils/**
- Purpose: Shared utilities
- Source: File cleanup, common functions
- Committed: Yes

**.planning/**
- Purpose: Project planning documents (this codebase map)
- Source: Generated by /gsd:map-codebase
- Committed: Yes

---

*Structure analysis: 2026-01-11*
*Update when directory structure changes*
