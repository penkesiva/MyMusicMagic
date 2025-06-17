#!/bin/bash

# MyMusicMagic Development Server Initialization Script
# This script sets up and runs the development server on port 3000

set -e  # Exit on any error

echo "🎵 MyMusicMagic - Development Server Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_success "Node.js version: $NODE_VERSION"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    print_success "npm version: $NPM_VERSION"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Dependencies installed successfully"
    else
        print_status "Dependencies already installed, checking for updates..."
        npm install
        print_success "Dependencies up to date"
    fi
}

# Check environment variables
check_env() {
    print_status "Checking environment variables..."
    
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local file not found"
        print_status "Please make sure you have the following environment variables set:"
        echo "  - NEXT_PUBLIC_SUPABASE_URL"
        echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "  - SUPABASE_SERVICE_ROLE_KEY"
        echo ""
        print_status "You can create a .env.local file with these variables"
    else
        print_success "Environment file found"
    fi
}

# Kill any process running on port 3000
kill_port_3000() {
    print_status "Checking if port 3000 is available..."
    
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port 3000 is already in use. Attempting to kill existing process..."
        PID=$(lsof -ti:3000)
        kill -9 $PID 2>/dev/null || true
        sleep 2
        print_success "Port 3000 is now available"
    else
        print_success "Port 3000 is available"
    fi
}

# Run the development server
start_server() {
    print_status "Starting development server on port 3000..."
    echo ""
    print_success "🚀 Server starting at: http://localhost:3000"
    print_status "Press Ctrl+C to stop the server"
    echo ""
    
    # Set the port explicitly and start the server
    PORT=3000 npm run dev
}

# Main execution
main() {
    echo ""
    print_status "Starting MyMusicMagic development server setup..."
    echo ""
    
    # Run all setup steps
    check_node
    check_npm
    install_dependencies
    check_env
    kill_port_3000
    
    echo ""
    print_success "Setup complete! Starting development server..."
    echo ""
    
    # Start the server
    start_server
}

# Handle script interruption
trap 'echo ""; print_warning "Server stopped by user"; exit 0' INT

# Run the main function
main 