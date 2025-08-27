#!/bin/sh
# Shell-agnostic script to stop development servers
# Works with bash, zsh, fish, and other POSIX shells

echo "🛑 Stopping Habit Tracker Development Servers..."

# Function to check if port is in use
port_in_use() {
    lsof -ti:"$1" >/dev/null 2>&1
}

# Stop backend (port 8000)
if port_in_use 8000; then
    echo "  Stopping backend server (port 8000)..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    echo "✅ Backend stopped"
else
    echo "ℹ️  Backend not running on port 8000"
fi

# Stop frontend (port 3000)
if port_in_use 3000; then
    echo "  Stopping frontend server (port 3000)..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    echo "✅ Frontend stopped"
else
    echo "ℹ️  Frontend not running on port 3000"
fi

echo ""
echo "🎉 All development servers stopped!"
echo "   To restart: scripts/dev-start.sh"
