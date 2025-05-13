#!/bin/bash

# Start frontend and backend services
echo "Starting SolViz Studio services..."

# Check if both services should be started
if [ "$1" == "all" ]; then
  # Start backend service in a new terminal window
  echo "Starting backend service..."
  cd ../backend && python -m uvicorn app.main:app --reload --port 8000 &
  
  # Start frontend service
  echo "Starting frontend service..."
  cd ../frontend && npm run dev
elif [ "$1" == "frontend" ]; then
  # Start only frontend
  echo "Starting frontend service..."
  cd ../frontend && npm run dev
elif [ "$1" == "backend" ]; then
  # Start only backend
  echo "Starting backend service..."
  cd ../backend && python -m uvicorn app.main:app --reload --port 8000
else
  echo "Usage: ./start.sh [all|frontend|backend]"
  echo "  all      - Start both frontend and backend services"
  echo "  frontend - Start only the frontend service"
  echo "  backend  - Start only the backend service"
  exit 1
fi
