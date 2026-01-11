# Technology Stack

**Analysis Date:** 2026-01-11

## Languages

**Primary:**
- TypeScript 5.2.2 - All frontend application code (`frontend/package.json`, `frontend/tsconfig.json`)
- Python 3.11 - All backend application code (`backend/Dockerfile`)

**Secondary:**
- JavaScript - Configuration files (vite.config.ts compiles to JS)
- CSS - Styling with Tailwind (`frontend/src/styles/index.css`)

## Runtime

**Environment:**
- Node.js (npm) - Frontend build and development
- Python 3.11 - Backend runtime via FastAPI/Uvicorn
- No `.nvmrc` or `.python-version` detected

**Package Manager:**
- npm - Frontend (`frontend/package.json`)
- pip with requirements.txt - Backend (`backend/requirements.txt`)
- No lock files detected for frontend

## Frameworks

**Core:**
- React 18.2.0 - UI framework (`frontend/package.json`)
- FastAPI 0.104.1 - Backend API framework (`backend/requirements.txt`, `backend/app/main.py`)
- React Router 6.20.0 - SPA routing

**Testing:**
- No test framework currently configured
- Manual testing via FastAPI docs (`/docs`)

**Build/Dev:**
- Vite 5.0.8 - Frontend bundler (`frontend/vite.config.ts`)
- vite-plugin-pwa 0.17.4 - PWA support with Workbox caching
- TypeScript 5.2.2 - Type checking and compilation
- Uvicorn 0.24.0 - ASGI server for FastAPI

## Key Dependencies

**Critical (Frontend):**
- `@supabase/supabase-js` 2.38.4 - Authentication (magic links) - `frontend/src/lib/supabase.ts`
- `pdfjs-dist` 3.11.174 - PDF viewing in browser
- `jsPDF` 2.5.2 + `jspdf-autotable` 3.8.4 - PDF generation for exports
- `xlsx` 0.18.5 - Excel export functionality

**Critical (Backend):**
- `anthropic` 0.7.7 - Claude API client - `backend/app/services/claude_client.py`
- `PyMuPDF` (fitz) 1.23.8 - PDF text extraction - `backend/app/services/pdf_processor.py`
- `Pillow` 10.1.0 - Image processing for vision features - `backend/app/services/vision_client.py`
- `pydantic` 2.5.0 - Request/response validation

**Infrastructure:**
- `httpx` 0.25.2 - Async HTTP client
- `python-jose` 3.3.0 - JWT handling (authentication)
- `passlib` 1.7.4 - Password hashing

**UI (Frontend):**
- Tailwind CSS 3.3.6 - Utility-first CSS framework
- `lucide-react` 0.556.0 - Icon library
- PostCSS 8.4.32 + Autoprefixer 10.4.16 - CSS processing

## Configuration

**Environment:**
- Frontend: `.env.local` with `VITE_*` prefixed variables
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (required)
  - `VITE_API_URL` (optional, auto-detected)
  - Theme vars: `VITE_PRIMARY_COLOR`, `VITE_ACCENT_COLOR`, `VITE_LOGO_URL`
- Backend: `.env` file
  - `ANTHROPIC_API_KEY` (required for Claude API)
  - `CORS_ORIGINS` (comma-separated allowed origins)
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY` (optional for auth verification)
  - `ENVIRONMENT` (development/production)

**Build:**
- `frontend/vite.config.ts` - Vite + PWA + React plugin
- `frontend/tsconfig.json` - Strict TypeScript with `@/*` path alias
- `frontend/.prettierrc` - Code formatting (no semicolons, single quotes)
- `frontend/.eslintrc.cjs` - Linting with TypeScript support

## Platform Requirements

**Development:**
- macOS/Linux/Windows (any platform with Node.js and Python)
- Node.js (no version specified, recommend 18+)
- Python 3.11+
- No external dependencies (no database, no Redis)

**Production:**
- Docker support via `backend/Dockerfile` (multi-stage build)
- `docker-compose.yml` with health checks
- PWA-ready (installable as app on mobile/desktop)
- Zero data retention (no persistent database)

---

*Stack analysis: 2026-01-11*
*Update after major dependency changes*
