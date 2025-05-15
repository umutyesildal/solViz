# SolViz Studio

![CI Status](https://github.com/username/solviz/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/username/solviz/branch/main/graph/badge.svg)](https://codecov.io/gh/username/solviz)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A natural language to visualization tool for Solana blockchain data. SolViz Studio allows users to ask questions in plain English about Solana blockchain data and receive interactive visualizations in response.

## Features

- **Natural Language Queries**: Ask questions in plain English and get data visualizations
- **Multiple Data Sources**: Integrates with Flipside, Helius, Bitquery, and Dune Analytics
- **Interactive Visualizations**: Uses Vega-Lite for customizable, interactive charts
- **User Dashboard**: Save and organize visualizations in personal dashboards
- **Public Sharing**: Share insights with the community

## Architecture

SolViz Studio consists of two main components:

1. **Frontend**: Next.js application with React 19 and Tailwind CSS
2. **Backend**: FastAPI Python server with SQLAlchemy and PostgreSQL

## Getting Started

For a complete step-by-step guide, see [GETTING-STARTED.md](GETTING-STARTED.md).

### Quick Start

Use the first-run script to set up and run the project:

```bash
# Complete setup and run both frontend and backend
./first-run.sh

# Setup and run just the frontend
./first-run.sh frontend

# Setup and run just the backend
./first-run.sh backend

# Run with Docker
./first-run.sh docker

# Quick start just the frontend (after initial setup)
./start-frontend.sh
```

This script will:
- Check for required tools (Node.js, Python, PostgreSQL)
- Set up environment files
- Install dependencies (using compatible versions)
- Configure the database (when running backend)
- Start the requested services

### Known Issues

- There's a compatibility conflict between React 19 and react-vega (which requires React ≤18)
- The installation uses `--legacy-peer-deps` to work around this issue
- Babel configuration is not compatible with Turbopack, so we use standard Next.js dev mode
- If you encounter problems, consider:
  1. Downgrading React to version 18
  2. Replacing react-vega with a React 19 compatible visualization library

### Prerequisites

- Python 3.10+
- Node.js 18.0+
- PostgreSQL 15+
- Docker & Docker Compose (optional, for containerized setup)

### Docker Setup

1. Make sure Docker and Docker Compose are installed
2. Create `.env` file with required API keys
3. Run the following command:

```bash
docker-compose up --build
```

### Manual Setup

#### Setting Up the Backend

1. Create and activate a virtual environment:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up environment variables:

```bash
# Create .env file with your configuration
touch .env
# Edit .env with your configuration
```

4. Initialize the database:

```bash
alembic upgrade head
```

### Setting Up the Frontend

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Create environment file:

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Running the Application

You can use the included start script to run the services:

```bash
cd scripts
./start.sh all     # Run both frontend and backend
./start.sh frontend # Run only frontend
./start.sh backend  # Run only backend
```

Alternatively, run the services manually:

**Backend:**
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Docker Deployment

To run the application using Docker:

```bash
docker-compose up
```

## API Credentials

You'll need to set up API credentials for the following services:

- Flipside Crypto
- Helius API
- (Optional) Bitquery
- (Optional) Dune Analytics

Add these credentials in the web interface after registering an account.

## Documentation

For detailed project information, refer to these documents:

- [Testing Documentation](TESTING.md) - Guide for running and writing tests
- [Testing Report](TESTING-REPORT.md) - Summary of test coverage and status
- [CI/CD for Testing](CI-CD-TESTING.md) - Details on the CI/CD testing pipeline
- [GitHub Setup](GITHUB-SETUP.md) - Repository configuration and best practices
- [Backend Test README](backend/README-TESTS.md) - Backend-specific test instructions

## CI/CD Pipeline

SolViz Studio uses GitHub Actions for continuous integration:

- **Automated Tests**: Every commit and PR runs the test suite
- **Code Coverage**: Coverage reports are generated and tracked via Codecov
- **Code Quality**: Linting and formatting checks ensure consistent code style

For local testing of CI workflows, install [Act](https://github.com/nektos/act) and run:

```bash
# Test frontend CI workflow
act -j frontend-tests

# Test backend CI workflow
act -j backend-tests
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request using the PR template.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
