#!/bin/bash

# Start Services Script for SolViz Studio
# This script starts both frontend and backend services

# Store the base directory path
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to display messages with emojis
info() { echo "ℹ️  $1"; }
success() { echo "✅ $1"; }
warning() { echo "⚠️  $1"; }
error() { echo "❌ $1"; }

# Check if Docker should be used
use_docker() {
  if [ "$1" == "--docker" ] || [ "$1" == "-d" ]; then
    return 0
  else
    return 1
  fi
}

# Start services with Docker
start_with_docker() {
  info "Starting services using Docker..."
  cd "$BASE_DIR" || exit 1
  
  # Check if .env file exists
  if [ ! -f ".env" ]; then
    info "Creating .env file for Docker..."
    cat > .env << EOL
SECRET_KEY=development_secret_key
FLIPSIDE_API_KEY=your_flipside_api_key
HELIUS_API_KEY=your_helius_api_key
OPENAI_API_KEY=your_openai_api_key
EOL
  fi
  
  # Start Docker Compose
  docker-compose up
}

# Start services locally
start_locally() {
  # Start PostgreSQL if not running
  if command -v pg_isready &> /dev/null; then
    if ! pg_isready -q; then
      info "Starting PostgreSQL service..."
      brew services start postgresql@15 2>/dev/null || brew services start postgresql 2>/dev/null
      sleep 2
    fi
  else
    warning "PostgreSQL command not found. Database may not be available."
  fi
  
  # Start backend
  info "Starting backend service..."
  cd "$BASE_DIR/backend" || exit 1
  
  # Check if virtual environment exists
  if [ ! -d "venv" ]; then
    error "Virtual environment not found. Please run first-run.sh first."
    exit 1
  fi
  
  # Activate virtual environment
  source venv/bin/activate || source venv/Scripts/activate
  
  # Start backend in background
  python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
  BACKEND_PID=$!
  success "Backend started at http://localhost:8000"
  
  # Start frontend
  info "Starting frontend service..."
  cd "$BASE_DIR/frontend" || exit 1
  
  npm run dev &
  FRONTEND_PID=$!
  success "Frontend started at http://localhost:3000"
  
  info "SolViz Studio is running!"
  info "- Frontend: http://localhost:3000"
  info "- Backend API: http://localhost:8000/docs"
  info "Press Ctrl+C to stop both services"
  
  # Wait for frontend to exit
  wait $FRONTEND_PID
  
  # Kill backend when frontend exits
  kill $BACKEND_PID 2>/dev/null
}

# Main execution
if use_docker "$1"; then
  start_with_docker
else
  start_locally
fi