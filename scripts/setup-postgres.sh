#!/bin/bash

# PostgreSQL setup script for SolViz Studio
# This script checks if PostgreSQL is running and sets up the required user and database

# Store the base directory path
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== SolViz PostgreSQL Setup ==="
echo "Base directory: $BASE_DIR"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL and try again."
    echo "   You can install PostgreSQL using: brew install postgresql@15"
    exit 1
fi

# Check if PostgreSQL service is running
if ! pg_isready -q; then
    echo "ℹ️ PostgreSQL is not running. Attempting to start PostgreSQL service..."
    brew services start postgresql@15 2>/dev/null || brew services start postgresql 2>/dev/null
    
    # Wait a few seconds for PostgreSQL to start
    sleep 5
    
    if ! pg_isready -q; then
        echo "❌ Failed to start PostgreSQL. Please start it manually and try again."
        echo "   You can start PostgreSQL using: brew services start postgresql@15"
        exit 1
    fi
    echo "✅ PostgreSQL service started"
fi

echo "✅ PostgreSQL is running"

# Get the current PostgreSQL user (usually the macOS username)
CURRENT_PG_USER=$(whoami)
echo "ℹ️ Current PostgreSQL user: $CURRENT_PG_USER"

# Check if the postgres user exists, if not create it
if ! psql -U "$CURRENT_PG_USER" -tAc "SELECT 1 FROM pg_roles WHERE rolname='postgres'" postgres | grep -q 1; then
    echo "ℹ️ Creating 'postgres' user..."
    psql -U "$CURRENT_PG_USER" -c "CREATE USER postgres WITH SUPERUSER PASSWORD 'postgres';" postgres
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create 'postgres' user. Please create it manually:"
        echo "   psql -c \"CREATE USER postgres WITH SUPERUSER PASSWORD 'postgres';\" postgres"
        exit 1
    fi
    echo "✅ Created 'postgres' user"
else
    echo "✅ PostgreSQL 'postgres' user already exists"
fi

# Check if the solviz database exists
if ! psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='solviz'" | grep -q 1; then
    echo "ℹ️ Creating 'solviz' database..."
    psql -U postgres -c "CREATE DATABASE solviz;"
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create 'solviz' database. Please create it manually:"
        echo "   psql -U postgres -c \"CREATE DATABASE solviz;\""
        exit 1
    fi
    echo "✅ Created 'solviz' database"
else
    echo "✅ PostgreSQL 'solviz' database already exists"
fi

# Create a .env file for backend with proper PostgreSQL connection
echo "ℹ️ Creating/updating backend .env file..."
cat > "$BASE_DIR/backend/.env" <<EOL
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
echo "✅ Backend .env file updated"

echo "ℹ️ Running migrations..."
cd "$BASE_DIR/backend" || exit
# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate || source venv/Scripts/activate
fi

# Install dependencies if alembic is not found
if ! pip show alembic &> /dev/null; then
    echo "ℹ️ Installing backend dependencies..."
    pip install -r requirements.txt
fi

# Run migrations
alembic upgrade head
if [ $? -ne 0 ]; then
    echo "❌ Failed to run migrations. Please check the error message above."
    exit 1
fi
echo "✅ Database migrations applied successfully"

echo "✨ PostgreSQL setup complete! The database is now ready for SolViz Studio."
echo "You can now start the application using: ./quick-start.sh"
