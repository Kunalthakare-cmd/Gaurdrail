#!/bin/bash

# Quick setup script for macOS/Linux

echo ""
echo "====================================="
echo "Guardrail Dashboard - Setup Script"
echo "====================================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 is not installed"
    echo "Please install Python 3.8+ from python.org"
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from nodejs.org"
    exit 1
fi

echo "✓ Python found:"
python3 --version
echo "✓ Node found:"
node --version
echo ""

# Backend setup
echo "Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt -q

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  IMPORTANT: Edit backend/.env with your API keys!"
fi

cd ..

# Frontend setup
echo ""
echo "Setting up Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install -q
fi

cd ..

echo ""
echo "====================================="
echo "Setup Complete!"
echo "====================================="
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your API keys"
echo "2. In Terminal 1: cd backend && source venv/bin/activate && python app.py"
echo "3. In Terminal 2: cd frontend && npm run dev"
echo "4. Open http://localhost:3000 in your browser"
echo ""
