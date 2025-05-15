#!/bin/bash

# Quick Start Script for SolViz Studio
# This script will set up and run the entire project: frontend, backend, and database

# Store the base directory path
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== SolViz Studio Quick Start ==="
echo "Base directory: $BASE_DIR"

# Check for Docker
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
  echo "✅ Docker and Docker Compose detected"
  USE_DOCKER=true
else
  echo "⚠️  Docker or Docker Compose not found. Falling back to local setup."
  USE_DOCKER=false
fi

# Function to create .env file if it doesn't exist
create_env_file() {
  if [ ! -f "$1" ]; then
    echo "Creating $1 file..."
    touch "$1"
    echo "$2" > "$1"
    echo "✅ Created $1 file"
  else
    echo "✅ $1 file already exists"
  fi
}

# Setup environment variables
ROOT_ENV="SECRET_KEY=development_secret_key
FLIPSIDE_API_KEY=your_flipside_api_key
HELIUS_API_KEY=your_helius_api_key
OPENAI_API_KEY=your_openai_api_key"

BACKEND_ENV="POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=solviz
POSTGRES_PORT=5432
SECRET_KEY=development_secret_key
ENVIRONMENT=development
BACKEND_CORS_ORIGINS=[\"http://localhost:3000\"]
FLIPSIDE_API_KEY=your_flipside_api_key
HELIUS_API_KEY=your_helius_api_key
OPENAI_API_KEY=your_openai_api_key"

FRONTEND_ENV="NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1"

# Create environment files
create_env_file "$BASE_DIR/.env" "$ROOT_ENV"
create_env_file "$BASE_DIR/backend/.env" "$BACKEND_ENV"
create_env_file "$BASE_DIR/frontend/.env.local" "$FRONTEND_ENV"

if [ "$USE_DOCKER" = true ]; then
  echo "🐳 Starting with Docker Compose..."
  
  # Run docker-compose
  docker-compose up --build
else
  echo "🖥️  Starting with local setup..."
  
  # Check if PostgreSQL is installed
  if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Please install PostgreSQL and try again."
    exit 1
  fi
  
  # Check if Node.js is installed
  if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js and try again."
    exit 1
  fi
  
  # Check if Python is installed
  if ! command -v python3 &> /dev/null; then
    echo "❌ Python not found. Please install Python and try again."
    exit 1
  fi
  
  # Start PostgreSQL if not running
  if ! pg_isready -q; then
    echo "Starting PostgreSQL..."
    brew services start postgresql@15 || brew services start postgresql
  fi
  
  # Create database if it doesn't exist
  if ! psql -lqt | cut -d \| -f 1 | grep -qw solviz; then
    echo "Creating database 'solviz'..."
    createdb solviz
  fi
  
  # Setup and start backend
  echo "Setting up backend..."
  cd "$BASE_DIR/backend" || exit
  python3 -m venv venv 2>/dev/null || python -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  
  # Run migrations
  echo "Running database migrations..."
  alembic upgrade head
  
  # Start backend in background
  echo "Starting backend server..."
  uvicorn app.main:app --reload --port 8000 &
  BACKEND_PID=$!
  # Return to base directory
  cd "$BASE_DIR" || exit
  
  # Setup and start frontend
  echo "Setting up frontend..."
  cd "$BASE_DIR/frontend" || exit
  npm install
  
  # Start frontend
  echo "Starting frontend server..."
  npm run dev
  
  # Clean up backend process when frontend is terminated
  kill $BACKEND_PID
fi

echo "✨ Setup complete! Access the application at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000/api/v1/docs"
