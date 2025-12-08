# Environment Variables Setup Guide

## Quick Setup

### Frontend (.env.local)

1. Copy the example file:
   ```bash
   cd frontend
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Backend (.env)

1. Copy the example file:
   ```bash
   cd backend
   cp env.example .env
   ```

2. Edit `.env` and add your API keys:
   ```
   ANTHROPIC_API_KEY=your-anthropic-key-here
   CORS_ORIGINS=http://localhost:3000
   ```

## Getting Your Credentials

### Supabase (for Authentication)

1. Go to https://supabase.com and sign up/login
2. Create a new project
3. Go to Project Settings → API
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_ANON_KEY`

### Anthropic (for AI Agents)

1. Go to https://console.anthropic.com/
2. Sign up/login
3. Go to API Keys section
4. Create a new API key
5. Copy it → `ANTHROPIC_API_KEY`

## File Locations

- Frontend: `/frontend/.env.local` (or `.env` for production)
- Backend: `/backend/.env`

**Note:** These files are in `.gitignore` so they won't be committed to git.
