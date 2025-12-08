# Backend Structure Document

## 1. Backend Architecture

Our backend is built as a lightweight, stateless web service using Python and FastAPI. Here’s how it’s organized:

• **FastAPI Framework**  
  – High-performance, async-capable web framework.  
  – Built‐in support for dependency injection, request validation, and automatic API docs (OpenAPI).  

• **Modular Router Pattern**  
  – One router per AI agent (`site-scribe`, `lookahead`, etc.).  
  – Shared utilities (file parsing, LLM client, rate limiting) live in a common module.  

• **Design Patterns**  
  – **Dependency Injection:** Clean separation of concerns (e.g., file parser, LLM client).  
  – **Asynchronous I/O:** Non-blocking PDF/image processing and API calls to Anthropic.  
  – **Middleware:** Centralized error handling, logging, and CORS.  

### Scalability, Maintainability, Performance

• **Statelessness** lets us spin up multiple instances behind a load balancer.  
• **Dockerized Deployment** ensures environment consistency across local, staging, and production.  
• **Async Tasks** keep API endpoints responsive during large-file parsing and streamed LLM responses.  
• **Clear Module Boundaries** speed up development of new agents or shared features.

---

## 2. Database Management

We adhere strictly to zero data retention. There is no persistent database in our backend:

• **Authentication & User Data**  
  – Handled entirely by Clerk or Supabase Auth.  
  – We only verify incoming JWT tokens; no user records or subscription info are stored.  

• **Session & Request Data**  
  – All inputs (voice, text, files) are processed in memory.  
  – Once an API response is sent, all request data is discarded immediately.  

• **Ephemeral Caching**  
  – No long‐term cache. If needed, in-memory LRU cache for small objects (e.g., LLM client config), but never user data.

---

## 3. Database Schema

**No persistent database** is used.  
All user authentication data lives off‐site (Clerk/Supabase). We maintain zero local schemas.

---

## 4. API Design and Endpoints

We follow a RESTful style. Each AI agent has a dedicated POST endpoint under `/api/{agent}`. All endpoints expect a JSON payload (plus multipart file uploads where needed) and return JSON with streaming support when applicable.

### Common Request Flow

1. Client sends JWT in `Authorization: Bearer` header.  
2. FastAPI middleware verifies token via Clerk/Supabase.  
3. Payload (text, voice blob, PDF/image file) is validated.  
4. File parsing (PyMuPDF or pdfplumber) if required.  
5. LLM (Claude) call—streamed response with SSE/chunking.  
6. Post‐processing into tables or formatted text.  
7. JSON response with `data`, `confidence`, and optional `citation` fields.

### Key Endpoints

• **/api/site-scribe/transform**  
  – Purpose: Convert voice/text notes into a polished email.  
  – Inputs: `{ text: string, tone?: string }` or voice blob.  
  – Outputs: `{ email: string, confidence: High|Med|Low }`  

• **/api/lookahead/generate**  
  – Purpose: Build a 2-week construction schedule from image/text.  
  – Inputs: image file (JPEG/PNG) or text prompt.  
  – Outputs: `{ scheduleTable: [...], confidence }`  

• **/api/code-commander/query**  
  – Purpose: Answer questions on a spec PDF with citations.  
  – Inputs: PDF file + `question: string`.  
  – Outputs: `{ answer: string, citations: [{ page, section }], confidence }`  

• **/api/contract-hawk/analyze**  
  – Purpose: Analyze contract PDF for risk items.  
  – Inputs: PDF file.  
  – Outputs: `{ risks: [{ clause, severity, plainEnglish }], confidence }`  

• **/api/submittal-scrubber/compare**  
  – Purpose: Compare two PDFs for submittal compliance.  
  – Inputs: two PDF files.  
  – Outputs: `{ results: [{ requirement, specRef, product, status }], confidence }`  

---

## 5. Hosting Solutions

### Backend on Render (or Railway)

• **Containerized Deployment** with Docker.  
• **Horizontal Scaling:** Auto‐scale instances based on HTTP load.  
• **Built‐in HTTPS & Custom Domains:** Managed TLS certificates.  
• **Preview Environments:** Optional per‐PR staging on Render.  

### Frontend on Vercel (for completeness)

• Static PWA assets served via a global CDN.  
• Edge functions are not needed for MVP since all dynamic logic lives in our FastAPI service.

**Benefits:** cost‐effective pay‐as‐you‐go, minimal ops overhead, reliable SLAs.

---

## 6. Infrastructure Components

• **Load Balancer** (Render’s managed LB) spreads traffic across backend instances.  
• **SSL/TLS** termination at the load balancer ensures encrypted transport.  
• **Content Delivery Network (CDN)** for frontend static assets via Vercel.  
• **In–Memory Cache (Optional)** for small shared data (e.g., LLM model config) using Python LRU.  
• **Worker Threads / Async I/O** handle CPU‐bound file parsing without blocking the event loop.  
• **Rate Limiting** middleware to prevent LLM‐cost spikes and abusive usage.

---

## 7. Security Measures

• **Authentication & Authorization**  
  – Passwordless magic‐link managed by Clerk or Supabase.  
  – JWT validation on every request.  

• **Zero Data Retention**  
  – No user data, files, or chats are saved after request completion.  

• **Data-in-Transit Encryption**  
  – HTTPS enforced by Render/Vercel.  
  – CORS policy restricted to our PWA domains.  

• **Input Validation & Size Limits**  
  – Reject PDFs > 25 MB or >100 pages.  
  – Reject images > 10 MB.  
  – Sanitize text inputs to guard against injection.  

• **Secrets Management**  
  – LLM API keys, Auth secrets, and other credentials stored in environment variables (Render’s secret store).  

• **Error Handling & Back-off**  
  – Graceful retries with exponential back-off on LLM rate limits.

---

## 8. Monitoring and Maintenance

• **Logging**  
  – Structured logs (JSON) capturing request IDs, endpoints, and error traces.  
  – Aggregated via Render’s log explorer or an external service (e.g., Datadog).  

• **Metrics & Alerts**  
  – Use FastAPI Prometheus middleware to expose request count, latencies, error rates.  
  – Hook into Grafana or Render alerts for threshold‐based notifications.  

• **Health Checks**  
  – `/health` endpoint returns 200 OK if dependencies (LLM, PDF parser) are ready.  
  – Automatic restarts on unhealthy status.  

• **Maintenance Strategy**  
  – Automated CI/CD on GitHub—passed tests and linting trigger staging deploy.  
  – Weekly dependency updates via automated bots (e.g., Dependabot).  
  – Scheduled load tests before major release.

---

## 9. Conclusion and Overall Backend Summary

Our backend is a lean, stateless FastAPI service that handles five distinct AI‐powered workflows. It integrates seamlessly with Clerk/Supabase for passwordless auth, enforces zero data retention, processes PDFs/images on the fly, and streams results from Claude 3.5 and Vision models. Containerized deployment on Render (or Railway) ensures reliability, auto-scaling, and minimal operational overhead. Security, monitoring, and maintenance practices are baked in from day one, aligning perfectly with the project’s goals of delivering a lightweight, privacy-first PWA for construction professionals.

With this structure, any developer or stakeholder can understand how requests flow from the browser to the LLM and back, how we keep user data safe, and how the system can grow to meet demand without sacrificing performance or maintainability.
