# Getting Started with SolViz Studio

This guide will help you run the SolViz Studio project for the first time, including both frontend and backend components with a PostgreSQL database.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Python](https://www.python.org/) (v3.10 or later)
- [PostgreSQL](https://www.postgresql.org/) (v15 recommended)
- [Docker](https://www.docker.com/) (optional, for containerized setup)

## Setup Options

You can run SolViz Studio in two ways:

1. **Using Docker Compose** - The simplest method that runs everything in containers
2. **Local Development Setup** - Running services directly on your machine

## Option 1: Using Docker Compose

### 1. Clone the repository (if you haven't already)

```bash
git clone <your-repository-url>
cd SolViz/SolViz/solviz
```

### 2. Create a .env file for environment variables

Create a `.env` file in the root directory with the following variables:

```
SECRET_KEY=your_secret_key_here
FLIPSIDE_API_KEY=your_flipside_api_key
HELIUS_API_KEY=your_helius_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. Build and start the containers

```bash
docker-compose up --build
```

This will:
- Build and start the frontend container (accessible at http://localhost:3000)
- Build and start the backend container (accessible at http://localhost:8000)
- Start a PostgreSQL database container
- Set up the network between the services

### 4. Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1/docs (Swagger UI)

## Option 2: Local Development Setup

For local development, you'll need to set up and run each component separately.

### 1. Set up the database

#### Install PostgreSQL (if not already installed)

```bash
# macOS (using Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb solviz
```

### 2. Set up the backend

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file in the backend directory
touch .env
```

Edit the `.env` file with the following content:

```
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=solviz
POSTGRES_PORT=5432
SECRET_KEY=your_secret_key_here
ENVIRONMENT=development
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
FLIPSIDE_API_KEY=your_flipside_api_key
HELIUS_API_KEY=your_helius_api_key
OPENAI_API_KEY=your_openai_api_key
```

#### Run database migrations

```bash
# From the backend directory with the virtual environment activated
alembic upgrade head
```

#### Start the backend server

```bash
# From the backend directory with the virtual environment activated
uvicorn app.main:app --reload --port 8000
```

### 3. Set up the frontend

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Create a .env.local file
touch .env.local
```

Edit the `.env.local` file with the following content:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

#### Start the frontend development server

```bash
# From the frontend directory
npm run dev
```

### 4. Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1/docs (Swagger UI)

## Using the Start Script

For convenience, you can also use the provided start script:

```bash
# Make the script executable
chmod +x scripts/start.sh

# Start both frontend and backend
./scripts/start.sh all

# Or start them individually
./scripts/start.sh frontend
./scripts/start.sh backend
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Ensure PostgreSQL is running:
   ```bash
   # Check if PostgreSQL is running
   pg_isready -h localhost
   ```

2. Verify connection details in the `.env` file

### CORS Issues

If you encounter CORS errors:

1. Check that `BACKEND_CORS_ORIGINS` in the backend `.env` file includes your frontend URL
2. Ensure you're using the correct API URL in the frontend

### Missing Dependencies

If you encounter missing dependency errors:

1. For backend: `pip install -r requirements.txt`
2. For frontend: `npm install`

## Next Steps

Once the application is running:

1. Register a new user account at http://localhost:3000/register
2. Log in to access the dashboard
3. Try creating visualizations with natural language queries

## API Documentation

The API documentation is available at:
- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc
