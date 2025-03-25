#!/bin/bash

# Display colorful messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== TraceHost Development Startup ===${NC}"
echo -e "${GREEN}Starting both frontend and backend servers...${NC}"

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for required tools
if ! command_exists npm; then
  echo -e "${RED}Error: npm not found. Please install Node.js and npm.${NC}"
  exit 1
fi

if ! command_exists python3; then
  echo -e "${RED}Error: python3 not found. Please install Python 3.${NC}"
  exit 1
fi

# Start Django backend
echo -e "${GREEN}Starting Django backend...${NC}"
cd Backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  echo -e "${BLUE}Creating virtual environment...${NC}"
  python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate || { echo -e "${RED}Failed to activate virtual environment${NC}"; exit 1; }

# Install requirements
echo -e "${BLUE}Installing Python dependencies...${NC}"
pip install -r requirements.txt

# Apply migrations
echo -e "${BLUE}Applying migrations...${NC}"
python3 manage.py migrate

# Start Django server in the background
echo -e "${GREEN}Starting Django server on http://localhost:8000${NC}"
python3 manage.py runserver > ../logs/django.log 2>&1 &
DJANGO_PID=$!

# Move back to root directory
cd ..

# Start Next.js frontend
echo -e "${GREEN}Starting Next.js frontend...${NC}"
cd Frontend

# Install npm dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo -e "${BLUE}Installing npm dependencies...${NC}"
  npm install
fi

# Start Next.js server
echo -e "${GREEN}Starting Next.js server...${NC}"
npm run dev > ../logs/nextjs.log 2>&1 &
NEXTJS_PID=$!

# Move back to root directory
cd ..

# Display status
echo -e "${BLUE}=== TraceHost Development Servers ===${NC}"
echo -e "${GREEN}Django server running on http://localhost:8000 (PID: $DJANGO_PID)${NC}"
echo -e "${GREEN}Next.js server running on http://localhost:3000 (PID: $NEXTJS_PID)${NC}"
echo -e "${BLUE}Logs are being saved to:${NC}"
echo -e "  - ${GREEN}logs/django.log${NC}"
echo -e "  - ${GREEN}logs/nextjs.log${NC}"
echo

# Function to clean up processes when script is terminated
cleanup() {
  echo -e "\n${RED}Shutting down servers...${NC}"
  kill $DJANGO_PID 2>/dev/null
  kill $NEXTJS_PID 2>/dev/null
  echo -e "${GREEN}Servers stopped.${NC}"
  exit 0
}

# Set up trap to call cleanup function when script receives termination signal
trap cleanup SIGINT SIGTERM

# Keep script running and display the latest log entries
echo -e "${BLUE}Watching logs (press Ctrl+C to stop all servers):${NC}"
tail -f logs/django.log logs/nextjs.log 