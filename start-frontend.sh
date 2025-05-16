#!/bin/bash

# Script to start only the SolViz frontend
# This is useful for development when you don't need the backend

# Store the base directory path
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to display messages with emojis
info() { echo "ℹ️  $1"; }
success() { echo "✅ $1"; }
warning() { echo "⚠️  $1"; }

# Display header
echo "=== SolViz Studio Frontend ===";
echo "Base directory: $BASE_DIR"

# Check Node.js version
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v | cut -d 'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -lt 18 ]; then
    warning "Node.js version 18+ is recommended, but found v$(node -v)"
    if command -v nvm &> /dev/null; then
      info "Using nvm to switch to a compatible Node.js version..."
      nvm use 18 2>/dev/null || nvm use 20 2>/dev/null || true
    fi
  fi
  success "Using Node.js $(node -v)"
else
  warning "Node.js not found. The frontend may not run correctly."
fi

# Ensure .env.local exists
if [ ! -f "$BASE_DIR/frontend/.env.local" ]; then
  info "Creating frontend environment file..."
  echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > "$BASE_DIR/frontend/.env.local"
  success "Created .env.local file"
else
  success "Found .env.local configuration"
fi

# Start frontend
info "Starting frontend service..."
cd "$BASE_DIR/frontend" || exit 1

# Check if using Turbopack was requested
if [ "$1" == "turbo" ]; then
  warning "Note: Turbopack might have compatibility issues with Babel configuration"
  info "Starting with Turbopack..."
  npm run dev -- --turbo
else
  info "Starting with standard Next.js development server..."
  npm run dev
fi
