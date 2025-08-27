#!/bin/sh
# Shell-agnostic development server startup script
# Works with bash, zsh, fish, and other POSIX shells

set -e  # Exit on any error

echo "🚀 Starting Habit Tracker Development Servers..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -ti:"$1" >/dev/null 2>&1
}

# Kill existing processes on ports 8000 and 3000
echo "🧹 Cleaning up existing processes..."
if port_in_use 8000; then
    echo "  Stopping backend on port 8000..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
fi

if port_in_use 3000; then
    echo "  Frontend already running on port 3000 (keeping it running)"
fi

# Check required commands
if ! command_exists python3 && ! command_exists python; then
    echo "❌ Python not found. Please install Python 3."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm not found. Please install Node.js and npm."
    exit 1
fi

# Start backend
echo "🔧 Starting backend server..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Run setup script first."
    exit 1
fi

# Activate virtual environment (shell-agnostic)
if [ -f "venv/bin/activate" ]; then
    . venv/bin/activate
elif [ -f "venv/Scripts/activate" ]; then
    . venv/Scripts/activate
else
    echo "❌ Cannot find virtual environment activation script."
    exit 1
fi

# Start backend in background
python main.py &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Wait a moment for backend to start
sleep 3

cd ..

# Start frontend if not already running
if ! port_in_use 3000; then
    echo "🎨 Starting frontend server..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    echo "✅ Frontend started (PID: $FRONTEND_PID)"
    cd ..
else
    echo "✅ Frontend already running"
fi

echo ""
echo "🎉 Development servers are running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📝 To stop servers:"
echo "   Press Ctrl+C or run: scripts/dev-stop.sh"
