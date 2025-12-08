# Tech Stack Document

This document explains the technology choices behind the **Hard Hat AI Pack** in everyday language. It outlines how each piece of technology fits together to deliver a fast, reliable, mobile-first Progressive Web App (PWA) for construction professionals.

## Frontend Technologies

We chose these tools to build the user interface and ensure a smooth, responsive experience on both phones and desktops:

*   **React**\
    A popular JavaScript library for building user interfaces. React lets us break the UI into small, reusable components (buttons, cards, modals) and load each AI agent only when it’s needed (lazy-loading).
*   **Tailwind CSS**\
    A utility-first styling framework that helps us create consistent, high-contrast, field-friendly designs quickly. It powers both the dark “Field Mode” (large touch targets, voice-first) and the light “Office Mode” (denser tables, keyboard input).
*   **Progressive Web App (PWA)**\
    Enables app-like behavior in the browser: offline caching, fast loading, and an installable experience without requiring app stores.
*   **Web Speech API**\
    A built-in browser feature for English voice input. Construction foremen can dictate notes on the job site, and the app transcribes them in real time.
*   **SheetJS & jsPDF**\
    Client-side libraries for exporting data. Users can download tables as Excel files (SheetJS) or generate PDF reports (jsPDF) directly in their browser—no server needed.

## Backend Technologies

The backend handles file processing, AI calls, and authentication in a simple, stateless way:

*   **Python & FastAPI**\
    A lightweight web framework that powers our API endpoints (one per AI agent). FastAPI streams user input to the AI model and returns responses as they arrive.
*   **PyMuPDF or pdfplumber**\
    Python libraries for parsing PDF files. They extract text and page structure so our AI agents can search, cite, and analyze documents on the fly.
*   **Docker (local development)**\
    Containers ensure every developer’s environment matches production. You can spin up the FastAPI server locally in a Docker container.
*   **Clerk or Supabase Auth**\
    A third-party passwordless authentication service. Users sign in via magic-link email; we only store minimal profile data (email, subscription status).

## Infrastructure and Deployment

Our hosting and deployment choices make it easy to deploy updates quickly and keep the app running smoothly:

*   **GitHub (version control)**\
    All code lives in a single repository, with pull-request previews for testing features before they go live.
*   **CI/CD pipelines (GitHub Actions or built-in)**\
    Automate tests and deployments on every code change to catch issues early.
*   **Vercel (frontend hosting)**\
    Delivers the React PWA with global edge caching for ultra-fast page loads—targeting under 3 seconds on 4G mobile.
*   **Railway or Render (backend hosting)**\
    Hosts the FastAPI server with automatic HTTPS, health checks, and optional preview environments for testing.
*   **Preview Environments**\
    Each pull request can spin up a temporary preview of both frontend and backend, making it easy to validate changes end to end.

## Third-Party Integrations

We rely on a few external services to add AI, video tutorials, and secure login:

*   **Anthropic Claude 3.5 Sonnet (LLM)**\
    The core AI model that powers all five agents. We stream user inputs and receive responses in real time.
*   **Claude Vision**\
    An extension of Anthropic’s AI for interpreting images. Used in the Lookahead Builder agent to analyze site photos.
*   **Vimeo or YouTube (video hosting)**\
    Hosts the “How to Use” tutorial videos. We embed them in an iframe. If a video isn’t available, static quick-start tips appear instead.
*   **Web Speech API**\
    (Also listed under Frontend.) No additional service needed for speech-to-text.
*   **Clerk or Supabase Auth**\
    (Also listed under Backend.) Handles user registration, magic-link emails, and session management.

## Security and Performance Considerations

We take both privacy and speed seriously to meet field-condition requirements:

*   **Zero Data Retention**\
    Uploaded files and chat content are never stored on our servers. We stream them to Claude, return the result, and immediately discard everything.
*   **Client-Side Validation**\
    PDF uploads are checked in the browser—max 25 MB and 100 pages. Image uploads capped at 10 MB. Users see clear error messages if limits are exceeded.
*   **Secure Communication**\
    All traffic uses HTTPS. We configure strict CORS policies on the backend to allow only our frontend origin.
*   **Session Expiry**\
    Magic-link sessions last up to 24 hours or until the browser closes, protecting shared devices on job sites.
*   **Lazy-Loading & Caching**\
    Each AI agent’s code loads only when selected, keeping initial download under control. The PWA’s service worker caches shared assets for offline resilience.
*   **Performance Targets**\
    • Initial load: under 3 seconds on a 4G connection\
    • Agent module load after first use: under 1 second

## Conclusion and Overall Tech Stack Summary

Our chosen stack balances speed, reliability, and field usability:

*   A **modular React + Tailwind PWA** provides fast, mobile-friendly UIs with two distinct modes (Field vs Office).
*   A **Python + FastAPI** backend streams data statelessly to **Anthropic Claude 3.5 Sonnet**, ensuring no files or chats are ever stored.
*   **Vercel** and **Railway/Render** deliver continuous deployment, global caching, and secure HTTPS endpoints.
*   **Clerk/Supabase Auth** simplifies secure passwordless login with minimal profile data.
*   **Client-side exports** (SheetJS, jsPDF) and **speech input** (Web Speech API) keep the experience self-contained, fast, and reliable in job-site conditions.

This tech stack aligns perfectly with our goals: a white-label SaaS that launches quickly, runs smoothly on mobile networks, enforces zero data retention, and offers a seamless PWA experience for construction professionals.
