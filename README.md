# Hard Hat AI Pack

A white-label Progressive Web App (PWA) for construction professionals, featuring five specialized AI agents powered by Claude 3.5 Sonnet.

## Project Structure

```
HardHat/
├── frontend/          # React + Vite + Tailwind PWA
├── backend/          # FastAPI + Python backend
├── documentation/     # Project documentation
└── docker-compose.yml # Local development setup
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Docker and Docker Compose (optional, for backend)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

### Backend Setup

**Option 1: Using Docker (Recommended)**

```bash
docker-compose up backend
```

**Option 2: Local Python**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend will run on `http://localhost:8000`

### Environment Variables

1. Copy `.env.example` files to `.env` (backend) and `.env.local` (frontend)
2. Fill in your Supabase and Anthropic API keys
3. See `.env.example` files for required variables

## Development

### Frontend Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Backend Commands

- `uvicorn app.main:app --reload` - Start development server with hot reload
- `pytest` - Run tests (when implemented)

## Features

- 🔐 Passwordless authentication (Supabase magic-link)
- 🤖 Five AI agents (Site Scribe, Lookahead Builder, Code & Spec Commander, Contract Hawk, Submittal Scrubber)
- 📱 Progressive Web App (PWA) with offline support
- 🎨 White-label theming system
- 🌓 Field Mode / Office Mode toggle
- 📄 PDF processing and analysis
- 🎤 Voice input support
- 📊 Export to clipboard, Excel, PDF

## Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Supabase Auth

**Backend:**
- Python 3.11
- FastAPI
- PyMuPDF (PDF processing)
- Anthropic Claude 3.5 Sonnet

**Infrastructure:**
- Vercel (frontend hosting)
- Railway/Render (backend hosting)
- Docker (containerization)

## Project Status

🚧 **In Development** - Phase 1: Foundation

Current progress:
- ✅ Project structure initialized
- ⏳ Authentication setup (in progress)
- ⏳ Dashboard skeleton (pending)

## License

Proprietary - All rights reserved

