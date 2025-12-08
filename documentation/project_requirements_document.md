# Project Requirements Document (PRD)

## 1. Project Overview

Hard Hat AI Pack is a white-label, browser-only Progressive Web App (PWA) built for Union construction foremen, project managers, superintendents, and contractors. It bundles five specialized AI agents—Site Scribe, Lookahead Builder, Code & Spec Commander, Contract Hawk, and Submittal Scrubber—into a single, mobile-first interface. Each agent addresses a distinct pain point in construction workflows: professional communication, two-week scheduling drafts, technical document search with citations, contract risk analysis, and product-spec compliance checking.

This suite is delivered as a SaaS subscription ($99–149/month) and aims to accelerate field and office productivity without storing any user data. The MVP launches January 10, 2025. Success is measured by rapid adoption among target users, sub-3-second load times on mobile networks, zero data retention compliance, and positive feedback on agent accuracy and overall ease of use.

---

## 2. In-Scope vs. Out-of-Scope

### In-Scope (MVP v1)
- Browser-only PWA (no native apps)
- Passwordless magic-link authentication (Clerk or Supabase Auth)
- Mandatory liability disclaimer on each session start
- Dashboard with five agent cards and global Field/Office mode toggle
- Five AI agents with defined inputs, outputs, exports, and confidence indicators
- Client-side PDF validation (≤25 MB, ≤100 pages) and image limits (≤10 MB)
- PDF processing via PyMuPDF or pdfplumber on backend; Excel/PDF exports via SheetJS/jsPDF in browser
- Web Speech API for English voice input
- Video overlay or quick-start text per agent (“How to Use”)
- White-label theming: logo, product name, primary/accent colors, favicon via config
- Hosting: Vercel for frontend, Railway (or Render) for FastAPI backend
- Single-repo, modular architecture with lazy-loaded agent bundles
- Zero data retention: discard all files and chats after streaming to Claude 3.5 Sonnet

### Out-of-Scope (Planned for Later Phases)
- In-app subscription and payment integration (Stripe, PayPal)
- Multi-tenant theming or custom domains per customer
- Role-based permissions or admin dashboards
- Multi-language support beyond English
- Formal WCAG 2.1 AA compliance audit or advanced ARIA attributes
- On-server file storage or conversation history
- Large-document chunking/RAG pipelines
- Native mobile or desktop applications

---

## 3. User Flow

A new user visits the PWA and lands on a clean sign-in screen. They enter their email address and receive a magic-link via email. Upon clicking the link, they’re authenticated and redirected to the liability disclaimer modal—full-screen overlay that requires acknowledgment (“I agree this is AI and I will verify outputs”) before accessing the app.

Once the disclaimer is accepted, users see the dashboard with five large, icon-driven cards for each agent. A header toggle switches between Field Mode (dark theme, voice-first UI, large touch targets) and Office Mode (light theme, denser tables, keyboard input). Tapping a card lazy-loads that agent’s workspace. Inside, users upload or enter inputs, view streaming AI responses with confidence badges, cite links or tables inline, and use export buttons (clipboard, mailto, Excel, PDF). Hitting the back arrow returns them to the dashboard to select another agent or end the session.

---

## 4. Core Features

- **Authentication**
  - Email-based magic link (passwordless)
  - 24-hour session persistence or until browser close
- **Liability Disclaimer Modal**
  - Mandatory acknowledgment before each session
- **Dashboard & Mode Toggle**
  - Five agent cards: icon, title, one-line value prop
  - Field Mode vs Office Mode switch
- **Agent Workspaces** (lazy-loaded)
  1. **Site Scribe**: Voice/text input → professional email draft; tone toggle; mailto/clipboard export
  2. **Lookahead Builder**: Photo (Claude Vision) or text → two-week schedule table; clipboard/Excel export
  3. **Code & Spec Commander**: PDF upload + question → answer with page/section citations; clipboard export
  4. **Contract Hawk**: PDF upload → risk table with severity and plain-English notes; clipboard/Excel/PDF export
  5. **Submittal Scrubber**: Two PDFs → compliance table with pass/warn/fail; Excel export
- **Streaming AI Integration**
  - Anthropic Claude 3.5 Sonnet via FastAPI streaming endpoints
  - Real-time text rendering, inline citations, confidence badge (High/Med/Low)
- **File Validation & Processing**
  - Client-side checks: PDF ≤25 MB & 100 pages, images ≤10 MB
  - Backend processing with PyMuPDF or pdfplumber
- **Exports**
  - Clipboard, mailto, Excel (SheetJS), PDF (jsPDF) – all client-side
- **How-to Use Overlays**
  - Iframe-embedded unlisted Vimeo/YouTube or fallback bullet points
- **White-Label Theming**
  - Configurable logo, product name, primary & accent colors, favicon

---

## 5. Tech Stack & Tools

- **Frontend**  
  - React (PWA)  
  - Tailwind CSS  
  - Web Speech API (en-US)  
  - SheetJS, jsPDF (client exports)  
- **Backend**  
  - Python + FastAPI  
  - PyMuPDF or pdfplumber (PDF parsing)  
  - Docker container for local dev  
  - Railway or Render (production & previews)  
- **AI & NLP**  
  - Anthropic Claude 3.5 Sonnet (LLM)  
  - Claude Vision (image input for Lookahead)  
- **Auth & Identity**  
  - Clerk or Supabase Auth (magic-link)  
- **Hosting & Deployment**  
  - Vercel (frontend)  
  - Railway/Render (backend)  
  - GitHub Actions or native Vercel/Render CI for auto-deploy  
- **Config & Theming**  
  - Environment variables or JSON config file  

---

## 6. Non-Functional Requirements

- **Performance**  
  - Initial load: <3 s on 4G/LTE mobile  
  - Agent module lazy-loads under 1 s after first use  
- **Security & Privacy**  
  - No persistent file or chat storage  
  - HTTPS everywhere, secure CORS policies  
  - CSV/Excel exports sanitized client-side  
- **Reliability**  
  - 99.9% uptime SLA for core dashboard and auth flows  
- **Usability & Accessibility**  
  - 44 px+ touch targets, visible focus states  
  - Semantic HTML, sufficient color contrast  
  - Alt text on icons, color+icon status indicators  
- **Compliance**  
  - GDPR-friendly: no personal data stored beyond minimal profile  
  - Liability disclaimer each session  

---

## 7. Constraints & Assumptions

- Browser-only; no native mobile or desktop apps in MVP  
- English-only UI, voice input, and LLM responses  
- LLM availability: requires Claude 3.5 Sonnet API access and quota  
- Single deployment pipeline acceptable (Render preview environments optional)  
- No per-tenant database or multi-tenant theming engine  
- Client devices must support PWA & Web Speech API (modern iOS/Android/Chrome)  

---

## 8. Known Issues & Potential Pitfalls

- **LLM Rate Limits & Costs**  
  - High concurrency may hit Anthropic quotas; implement exponential back-off and error UI  
- **Large File Handling**  
  - Mobile devices may struggle with 25 MB PDF parsing; ensure clear messaging and fallback  
- **Streaming UX Complexity**  
  - Synchronizing partial table renders can be tricky; use skeleton loaders and chunked updates  
- **Voice Recognition Accuracy**  
  - Background noise on jobsite can degrade Web Speech API; provide a clear text fallback  
- **Third-Party Embeds**  
  - Video iframes (YouTube/Vimeo) may be blocked by enterprise firewalls; fallback text must be robust  
- **Cross-Browser PWA Limitations**  
  - iOS may have storage/quota limits for PWA; audit caching strategy and service worker scope  

---

This PRD provides a clear, unambiguous roadmap for building the Hard Hat AI Pack MVP. Subsequent documents—like the technical stack specification, frontend and backend architecture guides, UI component library details, and security guidelines—can be derived directly from this foundation without additional clarification.