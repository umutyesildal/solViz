#!/bin/bash

# Docker Helper Script for SolViz Studio
# This script provides helpful commands for managing Docker services

# Store the base directory path
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to display messages with emojis
info() { echo "ℹ️  $1"; }
success() { echo "✅ $1"; }
warning() { echo "⚠️  $1"; }
error() { echo "❌ $1"; }

# Print usage information
usage() {
  echo "Docker Helper Script for SolViz Studio"
  echo ""
  echo "Usage: $0 [command]"
  echo ""
  echo "Commands:"
  echo "  start         Start all services with Docker"
  echo "  stop          Stop all Docker containers"
  echo "  restart       Restart all Docker containers"
  echo "  rebuild       Rebuild and start all containers"
  echo "  logs          Show logs for all containers"
  echo "  logs-backend  Show logs for backend container"
  echo "  logs-frontend Show logs for frontend container"
  echo "  logs-db       Show logs for database container"
  echo "  ps            List all Docker containers"
  echo "  clean         Remove all containers and volumes"
  echo "  help          Show this help message"
  echo ""
}

# Check if Docker is installed
check_docker() {
  if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    error "Docker and/or Docker Compose not found. Please install Docker and try again."
    exit 1
  fi
}

# Create .env file if it doesn't exist
check_env_file() {
  if [ ! -f "$BASE_DIR/.env" ]; then
    info "Creating .env file for Docker..."
    cat > "$BASE_DIR/.env" << EOL
SECRET_KEY=development_secret_key
FLIPSIDE_API_KEY=your_flipside_api_key
HELIUS_API_KEY=your_helius_api_key
OPENAI_API_KEY=your_openai_api_key
EOL
    success "Created .env file"
  fi
}

# Start Docker services
start_services() {
  info "Starting Docker services..."
  cd "$BASE_DIR" || exit 1
  check_env_file
  docker-compose up -d
  success "Services started!"
  info "- Frontend: http://localhost:3000"
  info "- Backend API: http://localhost:8000/docs"
}

# Stop Docker services
stop_services() {
  info "Stopping Docker services..."
  cd "$BASE_DIR" || exit 1
  docker-compose down
  success "Services stopped"
}

# Restart Docker services
restart_services() {
  info "Restarting Docker services..."
  cd "$BASE_DIR" || exit 1
  docker-compose restart
  success "Services restarted"
}

# Rebuild and start Docker services
rebuild_services() {
  info "Rebuilding Docker services..."
  cd "$BASE_DIR" || exit 1
  check_env_file
  docker-compose down
  docker-compose build --no-cache
  docker-compose up -d
  success "Services rebuilt and started!"
}

# Show logs for all containers
show_logs() {
  info "Showing logs for all services..."
  cd "$BASE_DIR" || exit 1
  docker-compose logs -f
}

# Show logs for a specific container
show_service_logs() {
  local service=$1
  info "Showing logs for $service..."
  cd "$BASE_DIR" || exit 1
  docker-compose logs -f "$service"
}

# List all Docker containers
list_containers() {
  info "Listing Docker containers..."
  cd "$BASE_DIR" || exit 1
  docker-compose ps
}

# Clean up Docker containers and volumes
clean_docker() {
  info "Cleaning up Docker containers and volumes..."
  cd "$BASE_DIR" || exit 1
  
  read -p "This will remove all containers and volumes. Continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    info "Operation cancelled"
    exit 0
  fi
  
  docker-compose down -v
  success "Cleanup completed"
}

# Main execution
check_docker

# Process command
case "$1" in
  start)
    start_services
    ;;
  stop)
    stop_services
    ;;
  restart)
    restart_services
    ;;
  rebuild)
    rebuild_services
    ;;
  logs)
    show_logs
    ;;
  logs-backend)
    show_service_logs backend
    ;;
  logs-frontend)
    show_service_logs frontend
    ;;
  logs-db)
    show_service_logs db
    ;;
  ps)
    list_containers
    ;;
  clean)
    clean_docker
    ;;
  help|--help|-h)
    usage
    ;;
  *)
    usage
    exit 1
    ;;
esac