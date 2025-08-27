#!/bin/sh
# Shell-agnostic setup script for Habit Tracker
# Works with bash, zsh, fish, and other POSIX shells

set -e  # Exit on any error

echo "🏗️  Setting up Habit Tracker Development Environment..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists python3 && ! command_exists python; then
    echo "❌ Python not found. Please install Python 3.8+."
    echo "   macOS: brew install python"
    echo "   Ubuntu: sudo apt install python3 python3-venv"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm not found. Please install Node.js and npm."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

if ! command_exists git; then
    echo "❌ git not found. Please install git."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup backend
echo ""
echo "🐍 Setting up Python backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "  Creating virtual environment..."
    if command_exists python3; then
        python3 -m venv venv
    else
        python -m venv venv
    fi
fi

# Activate virtual environment (shell-agnostic)
echo "  Activating virtual environment..."
if [ -f "venv/bin/activate" ]; then
    . venv/bin/activate
elif [ -f "venv/Scripts/activate" ]; then
    . venv/Scripts/activate
else
    echo "❌ Cannot find virtual environment activation script."
    exit 1
fi

# Install Python dependencies
echo "  Installing Python dependencies..."
pip install --upgrade pip
pip install -r ../requirements.txt

# Setup environment variables
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "  Creating .env from template..."
        cp .env.example .env
        echo ""
        echo "⚠️  IMPORTANT: Edit backend/.env with your actual credentials:"
        echo "   - SUPABASE_SERVICE_ROLE_KEY=your_actual_key_here"
        echo ""
    else
        echo "⚠️  .env.example not found. Create .env manually with your credentials."
    fi
fi

cd ..

# Setup frontend
echo ""
echo "⚛️  Setting up React frontend..."
cd frontend

echo "  Installing npm dependencies..."
npm install

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit backend/.env with your Supabase credentials"
echo "   2. Start development servers: ./scripts/dev-start.sh"
echo "   3. Open http://localhost:3000"
echo ""
echo "📚 Documentation: docs/README.md"
