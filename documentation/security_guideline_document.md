# Hard Hat AI Pack: Step-by-Step Implementation Plan

This implementation plan is organized into three phases, covering frontend, backend, AI‐agent integration, deployment, and security. Each step incorporates secure‐by‐design principles, input validation, least privilege, and defense in depth.

---

## Phase 0: Project Setup & Common Infrastructure (Mid-Dec)

### 1. Repository & Monorepo Configuration
- Initialize a Git monorepo with two folders: `/frontend` (React + Tailwind) and `/backend` (FastAPI).
- Add `.gitignore`, `Dockerfile`, `docker-compose.yml`, and lockfiles (`package-lock.json`, `Pipfile.lock`).
- Configure pre-commit hooks (e.g., `black`, `isort`, `eslint`, `prettier`) for consistent code style.

### 2. Local Development Environment
- Write `docker-compose.yml`:
  - Frontend service (Node 18+), Backend service (Python 3.10+), and a local SMTP mock (for magic links).
  - Ensure bind‐mounts for live reload.
- Document setup steps in `README.md`.

### 3. Secure Defaults & CI/CD Starter
- Create GitHub Actions or GitLab CI pipeline skeleton:
  - Linting, type checking, vulnerability scanning (e.g., `npm audit`, `pip-audit`).
  - Build and test stages.
- Enforce branch protection and require pull requests.

---

## Phase 1: Authentication, Theming & Core UI/UX (Dec 15–20)

### 1. Authentication & Session Management
- Choose Clerk or Supabase Auth (passwordless magic link).
- Implement signup/login flows:
  - Client: React context for auth state, `useAuth()` hook.
  - Server: Validate incoming magic‐link callbacks, issue JWT access tokens (exp ≈ 15 min) and refresh tokens (httpOnly, Secure cookies).
  - Enforce HTTPS-only cookies with `SameSite=Lax`, `HttpOnly`, `Secure`.
- Minimal user model: `{ email, subscriptionStatus, companyName }`.

### 2. White-Label Theming
- Create a JSON/YAML `theme.config` file or ENV variables for:
  - `LOGO_URL`, `PRIMARY_COLOR`, `ACCENT_COLOR`, `FAVICON_URL`, `PRODUCT_NAME`.
- Implement a ThemeProvider in React to inject CSS variables.
- Secure: sanitize URLs and color inputs.

### 3. Global Layout & Components
- Liability Disclaimer Modal:
  - Triggers once per session; persist consent in `sessionStorage`.
  - Don’t reveal internal logic or stack traces.
- Dashboard Skeleton:
  - Header (logo, theme toggle), Sidebar (agent cards), Field/Office toggle.
  - 44px+ touch targets, accessible semantic HTML.
  - Toggle state persisted in local state (no user data stored server‐side).
- Shared Components:
  - Button, Card, Spinner, Toast (no sensitive info in toasts).  
  - Implement basic error boundary to fail securely.

### 4. API Skeleton & Security
- FastAPI project scaffold:
  - Use `uvicorn` with TLS in production (via proxy).
  - Create routers: `/api/auth`, `/api/site-scribe`, etc.
- CORS Policy:
  - Restrict `origins` to your frontend domain.
  - Allow only needed methods.
- Rate limiting stub (middleware) for brute‐force protection.
- Input validation via Pydantic models.

---

## Phase 2: Agent Implementations & File Handling (Dec 23–30)

### 1. Common File Upload Validation
- In React, limit file size:
  - PDFs ≤ 25 MB, ≤ 100 pages (use PDF.js client‐side to count pages).
  - Images ≤ 10 MB.
- Sanitize filenames, reject path traversal.
- FastAPI endpoints should re-validate file size and type.

### 2. PDF/Text Processing Agents
For each agent endpoint (`POST /api/{agent}/transform`):
- Parse multipart/form-data securely; scan for malicious content.
- Use PyMuPDF or pdfplumber:
  - Extract text, images, metadata.
  - Enforce page count limit.
- Construct prompt for Claude 3.5 Sonnet via secure server-to-server call (TLS).
- Return structured JSON: `{ outputHtml, confidenceScore }`.
- Client: render with `dangerouslySetInnerHTML` only after sanitization (e.g., `DOMPurify`).

### 3. Lookahead Builder (Image + Text)
- Client: preview upload, send image + text fields.
- Server: extract text via PyMuPDF or Tesseract (if needed).
- Generate response cards.

### 4. Contract Hawk & Submittal Scrubber
- Endpoint design:
  - Accept JSON or PDF + JSON.
  - Use robust Pydantic schemas.
- API responses include annotations or redlines.
- Client: visualize changes, allow CSV/Excel export via SheetJS:
  - Sanitize cell values to prevent CSV injection.

### 5. Export Functionality (Client-Side)
- Excel via SheetJS: generate workbooks in-browser, trigger download.
- PDF via jsPDF: embed sanitized HTML.
- No data stored on server; everything streams to client.

### 6. AI Agent Integration Tests
- Mock Claude API with canned responses for CI.
- Test success and failure modes (timeout, invalid input).
- Ensure errors return generic messages (no internal traces).

---

## Phase 3: Polishing, Testing & Deployment (Jan 1–10)

### 1. End-to-End Testing
- Use Playwright or Cypress:
  - Auth flow, liability modal, agent workflows, file limits.
  - Accessibility smoke tests (e.g., Axe) for contrast & landmarks.

### 2. PWA & Offline Support
- Configure `manifest.json` and service worker:
  - Cache shell assets only; do not cache API responses (to avoid data retention).
- Test installability on Android/iOS.

### 3. Security Audit & Performance
- Run SCA tools (e.g., Dependabot, Snyk) to catch vulnerable dependencies.
- Penetration checklist:
  - Verify HTTPS, HSTS header.
  - CSP header to prevent XSS.
  - CSRF tokens for form submissions beyond magic link.
- Minify & tree‐shake frontend bundles.

### 4. Production Deployment
- Frontend on Vercel:
  - Environment variables for theming & auth.
  - Enforce HTTPS and custom domains.
- Backend on Railway/Render:
  - Docker image with `uvicorn --ssl-keyfile ...` behind a TLS terminator.
  - Use secrets management for API keys (Anthropic), SMTP, database (if any).
- Rollout strategy:
  - Deploy to staging first; run smoke tests.
  - Promote to production.

### 5. Monitoring & Logging
- Integrate lightweight error tracking (e.g., Sentry), but scrub PII.
- Use stdout JSON logs; rotate logs automatically.
- Set up uptime checks.

---

## Post-MVP Considerations
- **MFA** for higher‐privilege users.
- **Subscription Management** API integration.
- **Audit Logging** for compliance.
- **Role-Based Access Control** for future multi-role support.
- **GDPR/CCPA** data deletion flows.

---

**By following this phased approach,** we ensure a secure, performant, and user-centric PWA that meets the MVP deadline and lays the foundation for future enhancements.