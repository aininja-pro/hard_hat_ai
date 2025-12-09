#!/bin/bash
# Kill existing backend and start fresh

echo "Stopping any existing backend processes on port 8000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
sleep 2

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

echo ""
echo "Starting Hard Hat AI Backend..."
echo "Working directory: $(pwd)"
echo "Python: $(which python3)"
echo "Logs will appear below. Press Ctrl+C to stop."
echo ""

python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

