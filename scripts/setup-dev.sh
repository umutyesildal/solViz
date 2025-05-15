#!/bin/bash

# Development environment setup script for SolViz Studio
# This script sets up the development environment for both frontend and backend

# Store the base directory path
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== SolViz Studio Development Environment Setup ==="
echo "Base directory: $BASE_DIR"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to display a message with a colored prefix
message() {
  local prefix=$1
  local text=$2
  echo "$prefix $text"
}

info() {
  message "ℹ️" "$1"
}

success() {
  message "✅" "$1"
}

warning() {
  message "⚠️" "$1"
}

error() {
  message "❌" "$1"
}

# Check for required tools
info "Checking required tools..."

# Check for Python
if command_exists python3; then
  PYTHON_CMD="python3"
  success "Python 3 found"
elif command_exists python; then
  PYTHON_CMD="python"
  PY_VERSION=$(python --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1)
  if [ "$PY_VERSION" -lt 3 ]; then
    error "Python 3.10+ is required, but Python $PY_VERSION is installed"
    exit 1
  fi
  success "Python 3 found"
else
  error "Python 3.10+ is required but not found"
  info "Please install Python 3.10 or later and try again"
  exit 1
fi

# Check for Node.js
if command_exists node; then
  NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -lt 18 ]; then
    warning "Node.js 18+ recommended, but version $NODE_VERSION is installed"
  else
    success "Node.js $NODE_VERSION found"
  fi
else
  error "Node.js 18+ is required but not found"
  info "Please install Node.js 18 or later and try again"
  exit 1
fi

# Check for PostgreSQL
if command_exists psql; then
  success "PostgreSQL found"
else
  warning "PostgreSQL not found"
  info "PostgreSQL will need to be installed or run via Docker"
fi

# Check for Docker (optional)
if command_exists docker && command_exists docker-compose; then
  success "Docker and Docker Compose found (optional)"
  HAS_DOCKER=true
else
  info "Docker and Docker Compose not found (optional)"
  HAS_DOCKER=false
fi

# Set up backend
info "Setting up backend environment..."
cd "$BASE_DIR/backend" || exit

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  info "Creating Python virtual environment..."
  $PYTHON_CMD -m venv venv
  if [ $? -ne 0 ]; then
    error "Failed to create Python virtual environment"
    exit 1
  fi
  success "Created Python virtual environment"
fi

# Activate virtual environment
info "Activating virtual environment..."
source venv/bin/activate || source venv/Scripts/activate

# Install backend dependencies
info "Installing backend dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
  error "Failed to install backend dependencies"
  exit 1
fi
success "Installed backend dependencies"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
  info "Creating backend .env file..."
  cat > .env << EOL
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=solviz
POSTGRES_PORT=5432
SECRET_KEY=development_secret_key
ENVIRONMENT=development
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
FLIPSIDE_API_KEY=your_flipside_api_key
HELIUS_API_KEY=your_helius_api_key
OPENAI_API_KEY=your_openai_api_key
EOL
  success "Created backend .env file"
else
  info "Backend .env file already exists"
fi

# Deactivate virtual environment
deactivate

# Set up frontend
info "Setting up frontend environment..."
cd "$BASE_DIR/frontend" || exit

# Install frontend dependencies
info "Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
  error "Failed to install frontend dependencies"
  exit 1
fi
success "Installed frontend dependencies"

# Create .env.local file if it doesn't exist
if [ ! -f ".env.local" ]; then
  info "Creating frontend .env.local file..."
  cat > .env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
EOL
  success "Created frontend .env.local file"
else
  info "Frontend .env.local file already exists"
fi

# Final instructions
echo ""
echo "=== Development Environment Setup Complete ==="
echo ""
echo "To start the development servers:"
echo ""
echo "1. Initialize the database:"
echo "   ./scripts/init-db.sh"
echo ""
echo "2. Start the application:"
echo "   ./quick-start.sh"
echo ""
echo "Alternatively, start the services individually:"
echo ""
echo "Backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload --port 8000"
echo ""
echo "Frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "If you prefer to use Docker:"
echo "   docker-compose up --build"
echo ""
success "Setup complete!"
