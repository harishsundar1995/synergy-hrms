#!/bin/bash

# Synergy Well - Development Environment Startup Script
# This script starts all required services for the platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_PORT=8080
BACKEND_PORT=3001
MONGODB_PORT=27017

# Log function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if port is in use
check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        local pid=$(lsof -Pi :$port -sTCP:LISTEN -t)
        warning "$service port $port is already in use (PID: $pid)"
        
        echo -n "Do you want to kill the existing process? (y/N): "
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            kill -9 $pid 2>/dev/null || true
            sleep 2
            success "Killed existing process on port $port"
            return 0
        else
            error "Cannot start $service - port $port is occupied"
            return 1
        fi
    fi
    return 0
}

# Check if MongoDB is running
check_mongodb() {
    log "Checking MongoDB connection..."
    
    # Try to connect to MongoDB
    if ! mongosh --host localhost:$MONGODB_PORT --eval "db.runCommand('ping')" >/dev/null 2>&1; then
        error "MongoDB is not running on port $MONGODB_PORT"
        echo "Please start MongoDB using one of these methods:"
        echo "  - brew services start mongodb-community"
        echo "  - sudo systemctl start mongod"
        echo "  - mongod --dbpath /path/to/your/db"
        return 1
    fi
    
    success "MongoDB is running on port $MONGODB_PORT"
    return 0
}

# Install dependencies if needed
install_deps() {
    local dir=$1
    local name=$2
    
    if [ ! -d "$dir/node_modules" ]; then
        log "Installing $name dependencies..."
        cd "$dir"
        npm install
        cd - >/dev/null
        success "$name dependencies installed"
    else
        log "$name dependencies already installed"
    fi
}

# Kill all related processes on exit
cleanup() {
    log "Cleaning up processes..."
    
    # Kill processes by port
    for port in $FRONTEND_PORT $BACKEND_PORT; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            local pid=$(lsof -Pi :$port -sTCP:LISTEN -t)
            kill -9 $pid 2>/dev/null || true
        fi
    done
    
    # Kill background jobs
    jobs -p | xargs -r kill 2>/dev/null || true
    
    success "Cleanup completed"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    log "🚀 Starting Synergy Well Development Environment"
    
    # Get script directory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$SCRIPT_DIR"
    FRONTEND_DIR="$PROJECT_ROOT"
    BACKEND_DIR="$PROJECT_ROOT/backend"
    
    # Check if we're in the right directory
    if [ ! -f "$PROJECT_ROOT/package.json" ] || [ ! -f "$BACKEND_DIR/package.json" ]; then
        error "Script must be run from the project root directory"
        exit 1
    fi
    
    # Check MongoDB first
    if ! check_mongodb; then
        exit 1
    fi
    
    # Check ports
    if ! check_port $FRONTEND_PORT "Frontend"; then
        exit 1
    fi
    
    if ! check_port $BACKEND_PORT "Backend"; then
        exit 1
    fi
    
    # Install dependencies
    log "📦 Checking dependencies..."
    install_deps "$FRONTEND_DIR" "Frontend"
    install_deps "$BACKEND_DIR" "Backend"
    
    # Create log directory
    mkdir -p "$PROJECT_ROOT/logs"
    
    # Start Backend
    log "🔧 Starting Backend Server (Port: $BACKEND_PORT)..."
    cd "$BACKEND_DIR"
    npm run dev > "$PROJECT_ROOT/logs/backend.log" 2>&1 &
    BACKEND_PID=$!
    cd - >/dev/null
    
    # Wait for backend to start
    log "⏳ Waiting for backend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:$BACKEND_PORT/health >/dev/null 2>&1; then
            success "Backend started successfully on http://localhost:$BACKEND_PORT"
            break
        fi
        
        if [ $i -eq 30 ]; then
            error "Backend failed to start within 30 seconds"
            echo "Backend logs:"
            tail -20 "$PROJECT_ROOT/logs/backend.log"
            exit 1
        fi
        
        sleep 1
    done
    
    # Start Frontend
    log "🎨 Starting Frontend Server (Port: $FRONTEND_PORT)..."
    cd "$FRONTEND_DIR"
    npm run dev > "$PROJECT_ROOT/logs/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    cd - >/dev/null
    
    # Wait for frontend to start
    log "⏳ Waiting for frontend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
            success "Frontend started successfully on http://localhost:$FRONTEND_PORT"
            break
        fi
        
        if [ $i -eq 30 ]; then
            error "Frontend failed to start within 30 seconds"
            echo "Frontend logs:"
            tail -20 "$PROJECT_ROOT/logs/frontend.log"
            exit 1
        fi
        
        sleep 1
    done
    
    # Display status
    echo ""
    echo "🎉 All services are running!"
    echo ""
    echo "📱 Frontend:  http://localhost:$FRONTEND_PORT"
    echo "🔧 Backend:   http://localhost:$BACKEND_PORT"
    echo "🔧 API Docs:  http://localhost:$BACKEND_PORT/health"
    echo "🍃 MongoDB:   mongodb://localhost:$MONGODB_PORT"
    echo ""
    echo "📊 Service Status:"
    echo "   Frontend PID: $FRONTEND_PID"
    echo "   Backend PID:  $BACKEND_PID"
    echo ""
    echo "📝 Logs are available in:"
    echo "   Frontend: $PROJECT_ROOT/logs/frontend.log"
    echo "   Backend:  $PROJECT_ROOT/logs/backend.log"
    echo ""
    echo "💡 Commands:"
    echo "   View backend logs:  tail -f logs/backend.log"
    echo "   View frontend logs: tail -f logs/frontend.log"
    echo "   Stop all services:  Ctrl+C"
    echo ""
    
    # Keep script running and monitor services
    log "👀 Monitoring services... Press Ctrl+C to stop all services"
    
    while true; do
        # Check if processes are still running
        if ! kill -0 $BACKEND_PID 2>/dev/null; then
            error "Backend process died"
            break
        fi
        
        if ! kill -0 $FRONTEND_PID 2>/dev/null; then
            error "Frontend process died"
            break
        fi
        
        sleep 5
    done
}

# Run main function
main "$@"
