#!/bin/bash

# Script to initialize the PostgreSQL database for SolViz Studio
# This script will create the database and run initial migrations

# Store the base directory path
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Set environment variables
export PGUSER=${POSTGRES_USER:-postgres}
export PGPASSWORD=${POSTGRES_PASSWORD:-postgres}
export PGDATABASE=${POSTGRES_DB:-solviz}
export PGHOST=${POSTGRES_SERVER:-localhost}
export PGPORT=${POSTGRES_PORT:-5432}

echo "=== SolViz Database Initialization ==="

# Check if PostgreSQL is running
if ! pg_isready -q; then
  echo "❌ PostgreSQL is not running. Please start PostgreSQL and try again."
  exit 1
fi

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw $PGDATABASE; then
  echo "✅ Database '$PGDATABASE' already exists"
else
  echo "Creating database '$PGDATABASE'..."
  createdb $PGDATABASE
  if [ $? -eq 0 ]; then
    echo "✅ Database created successfully"
  else
    echo "❌ Failed to create database. Please check your PostgreSQL installation."
    exit 1
  fi
fi

# Change to the backend directory
cd "$BASE_DIR/backend" || exit

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv venv || python -m venv venv
  if [ $? -ne 0 ]; then
    echo "❌ Failed to create Python virtual environment. Please check your Python installation."
    exit 1
  fi
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate || source venv/Scripts/activate

# Install required packages if not already installed
if ! pip freeze | grep -q alembic; then
  echo "Installing required packages..."
  pip install -r requirements.txt
fi

# Run migrations
echo "Running database migrations..."
alembic upgrade head

if [ $? -eq 0 ]; then
  echo "✅ Database migrations applied successfully"
else
  echo "❌ Failed to apply migrations. Please check the error message above."
  exit 1
fi

echo "✨ Database initialization complete!"
echo "You can now start the application using ./quick-start.sh"
