#!/bin/bash

# First Run Script for SolViz Studio
# This script does a complete setup and first run of the entire application

# Store the base directory path
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "=== SolViz Studio First Run ==="
echo "Base directory: $BASE_DIR"

# Function to display messages with emojis
info() { echo "ℹ️  $1"; }
success() { echo "✅ $1"; }
warning() { echo "⚠️  $1"; }
error() { echo "❌ $1"; }

# Check required tools
check_requirements() {
  local component=$1
  info "Checking required tools..."
  
  # Check for Python if running backend or full stack
  if [ "$component" != "frontend" ]; then
    if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
      error "Python 3.10+ is required but not found"
      info "Please install Python 3.10 or later and try again"
      exit 1
    else
      success "Python found"
    fi
  fi
  
  # Always check for Node.js
  if ! command -v node &> /dev/null; then
    warning "Node.js is required but not found"
    info "Please install Node.js 18+ and try again"
    exit 1
  else
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d 'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
      warning "Node.js version 18+ is recommended, but found v$(node -v)"
      
      # Check if nvm is available
      if command -v nvm &> /dev/null; then
        info "You have nvm installed. Would you like to use a newer Node.js version?"
        read -p "Switch to Node.js 18+ using nvm? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
          # Try to use latest LTS version, fallback to other available versions
          nvm use --lts 2>/dev/null || nvm use 20 2>/dev/null || nvm use 18 2>/dev/null
          if [ $? -ne 0 ]; then
            info "To install Node.js 18+: nvm install --lts"
            read -p "Continue with current version anyway? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
              exit 1
            fi
          else
            success "Switched to Node.js $(node -v)"
          fi
        else
          read -p "Continue with the current version anyway? (y/n) " -n 1 -r
          echo
          if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            info "Please upgrade Node.js and try again"
            exit 1
          fi
        fi
      else
        info "Consider installing nvm to manage Node.js versions: https://github.com/nvm-sh/nvm"
        read -p "Continue with the current version anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
          info "Please upgrade Node.js and try again"
          exit 1
        fi
      fi
    else
      success "Node.js v$(node -v) found"
    fi
  fi
  
  # Check for PostgreSQL if running backend or full stack
  if [ "$component" != "frontend" ]; then
    if ! command -v psql &> /dev/null; then
      warning "PostgreSQL not found"
      info "Installing PostgreSQL is recommended for local development"
      read -p "Do you want to continue with Docker instead? (y/n) " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Please install PostgreSQL and try again"
        exit 1
      fi
      USE_DOCKER=true
    else
      success "PostgreSQL found"
      USE_DOCKER=false
    fi
  fi
}

# Setup PostgreSQL
setup_postgres() {
  info "Setting up PostgreSQL database..."
  
  if ! pg_isready -q; then
    info "Starting PostgreSQL service..."
    brew services start postgresql@15 2>/dev/null || brew services start postgresql 2>/dev/null
    sleep 3
  fi
  
  # Check if postgres user exists
  CURRENT_PG_USER=$(whoami)
  if ! psql -U "$CURRENT_PG_USER" -tAc "SELECT 1 FROM pg_roles WHERE rolname='postgres'" postgres 2>/dev/null | grep -q 1; then
    info "Creating 'postgres' user..."
    psql -U "$CURRENT_PG_USER" -c "CREATE USER postgres WITH SUPERUSER PASSWORD 'postgres';" postgres
    if [ $? -ne 0 ]; then
      warning "Could not create postgres user. Trying to proceed anyway..."
    else
      success "Created postgres user"
    fi
  fi
  
  # Check if database exists
  if ! psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='solviz'" postgres 2>/dev/null | grep -q 1; then
    info "Creating 'solviz' database..."
    psql -U postgres -c "CREATE DATABASE solviz;" postgres
    if [ $? -ne 0 ]; then
      error "Could not create database. Please create it manually:"
      info "psql -c \"CREATE DATABASE solviz;\""
      exit 1
    fi
    success "Created solviz database"
  else
    success "Database already exists"
  fi
}

# Setup backend
setup_backend() {
  info "Setting up backend..."
  cd "$BASE_DIR/backend" || exit 1
  
  # Create virtual environment if it doesn't exist
  if [ ! -d "venv" ]; then
    info "Creating Python virtual environment..."
    python3 -m venv venv 2>/dev/null || python -m venv venv
    if [ $? -ne 0 ]; then
      error "Failed to create virtual environment"
      exit 1
    fi
    success "Created virtual environment"
  fi
  
  # Activate virtual environment
  source venv/bin/activate || source venv/Scripts/activate
  
  # Install dependencies
  info "Installing backend dependencies..."
  pip install -r requirements.txt
  if [ $? -ne 0 ]; then
    error "Failed to install dependencies"
    exit 1
  fi
  success "Installed backend dependencies"
  
  # Create or update .env file
  info "Configuring backend environment..."
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
  success "Created backend environment file"
  
  # Run migrations
  info "Applying database migrations..."
  PYTHONPATH=$BASE_DIR/backend alembic upgrade head
  if [ $? -ne 0 ]; then
    error "Failed to apply migrations"
    exit 1
  fi
  success "Applied database migrations"
  
  # Deactivate virtual environment
  deactivate
}

# Setup frontend
setup_frontend() {
  info "Setting up frontend..."
  cd "$BASE_DIR/frontend" || exit 1
  
  # Install dependencies
  info "Installing frontend dependencies..."
  warning "There's a known conflict between react-vega (requires React ≤18) and React 19"
  info "Using --legacy-peer-deps flag to bypass dependency conflicts"
  npm install --legacy-peer-deps
  if [ $? -ne 0 ]; then
    error "Failed to install frontend dependencies"
    warning "If you're still encountering React version conflicts, consider:"
    info "1. Installing with: npm install --force"
    info "2. Downgrading React to version 18 in package.json"
    exit 1
  fi
  success "Installed frontend dependencies"
  
  # Create .env.local file
  info "Configuring frontend environment..."
  cat > .env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
EOL
  success "Created frontend environment file"
}

# Run both services
run_services() {
  info "Starting services..."
  
  # Check if both services should be started
  if [ "$USE_DOCKER" = true ]; then
    info "Starting services using Docker..."
    cd "$BASE_DIR" || exit 1
    docker-compose up
  else
    info "Starting backend service..."
    cd "$BASE_DIR/backend" || exit 1
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
    
    # Wait for user to press Ctrl+C
    wait $FRONTEND_PID
    
    # Clean up backend when frontend is stopped
    kill $BACKEND_PID 2>/dev/null
  fi
}

# Main execution
main() {
  case "$1" in
    frontend)
      info "Setting up and running frontend only..."
      check_requirements "frontend"
      setup_frontend
      run_frontend "$2"
      ;;
    frontend-turbo)
      info "Setting up and running frontend only (with Turbopack)..."
      warning "Note: Turbopack might not be compatible with some of our dependencies"
      check_requirements "frontend"
      setup_frontend
      run_frontend "turbo"
      ;;
    backend)
      info "Setting up and running backend only..."
      check_requirements "backend"
      if [ "$USE_DOCKER" != true ]; then
        setup_postgres
      fi
      setup_backend
      run_backend
      ;;
    docker)
      info "Using Docker for setup..."
      cd "$BASE_DIR" || exit 1
      
      # Create environment files for Docker
      cat > .env << EOL
SECRET_KEY=development_secret_key
FLIPSIDE_API_KEY=your_flipside_api_key
HELIUS_API_KEY=your_helius_api_key
OPENAI_API_KEY=your_openai_api_key
EOL
      
      # Start Docker services
      docker-compose up
      ;;
    *)
      check_requirements
      
      if [ "$USE_DOCKER" = true ]; then
        info "Using Docker for setup..."
        cd "$BASE_DIR" || exit 1
        
        # Create environment files for Docker
        cat > .env << EOL
SECRET_KEY=development_secret_key
FLIPSIDE_API_KEY=your_flipside_api_key
HELIUS_API_KEY=your_helius_api_key
OPENAI_API_KEY=your_openai_api_key
EOL
        
        # Start Docker services
        run_services
      else
        # Local setup
        setup_postgres
        setup_backend
        setup_frontend
        run_services
      fi
      ;;
  esac
}

# Run frontend only
run_frontend() {
  info "Starting frontend service..."
  cd "$BASE_DIR/frontend" || exit 1
  
  # Check if turbo flag was passed
  if [ "$1" == "turbo" ]; then
    info "Starting with Turbopack (experimental)..."
    npm run dev -- --turbo
  else
    info "Starting with standard Next.js dev server..."
    npm run dev
  fi
  
  success "Frontend started at http://localhost:3000"
}

# Run backend only
run_backend() {
  info "Starting backend service..."
  cd "$BASE_DIR/backend" || exit 1
  source venv/bin/activate || source venv/Scripts/activate
  python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
  success "Backend started at http://localhost:8000"
}

# Run main function with all arguments
main "$@"