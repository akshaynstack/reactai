#!/bin/bash

# Next.js Application Management Script
# This script manages the Next.js application with start, restart, and stop functions
# It reads PORT from .env.local and provides comprehensive logging

# Configuration
APP_NAME="reactai-app"
LOG_DIR="logs"
PID_FILE="$APP_NAME.pid"
LOG_FILE="$LOG_DIR/$APP_NAME.log"
ENV_FILE=".env.local"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages with timestamp
log_message() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Function to read PORT from .env.local
get_port() {
    if [ -f "$ENV_FILE" ]; then
        PORT=$(grep "^PORT=" "$ENV_FILE" | cut -d'=' -f2)
        if [ -n "$PORT" ]; then
            echo "$PORT"
        else
            echo "3000" # Default port if not found
        fi
    else
        echo "3000" # Default port if .env.local doesn't exist
    fi
}

# Function to check if the application is running
is_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        else
            rm -f "$PID_FILE"
            return 1
        fi
    else
        return 1
    fi
}

# Function to start the application
start_app() {
    if is_running; then
        local pid=$(cat "$PID_FILE")
        local port=$(get_port)
        echo -e "${YELLOW}Application is already running on port $port with PID $pid${NC}"
        log_message "INFO" "Start attempt - Application already running on port $port with PID $pid"
        return 1
    fi

    local port=$(get_port)
    echo -e "${BLUE}Starting application on port $port...${NC}"
    log_message "INFO" "Starting application on port $port"

    # Start the application in background and capture output
    nohup npm run dev > "$LOG_FILE" 2>&1 &
    local pid=$!
    
    # Save PID
    echo "$pid" > "$PID_FILE"
    
    # Wait a moment to check if it started successfully
    sleep 3
    
    if is_running; then
        echo -e "${GREEN}✓ Application started successfully on port $port with PID $pid${NC}"
        log_message "SUCCESS" "Application started successfully on port $port with PID $pid"
        echo -e "${BLUE}Access your application at: http://localhost:$port${NC}"
        log_message "INFO" "Application accessible at: http://localhost:$port"
    else
        echo -e "${RED}✗ Failed to start application${NC}"
        log_message "ERROR" "Failed to start application"
        rm -f "$PID_FILE"
        return 1
    fi
}

# Function to stop the application
stop_app() {
    if ! is_running; then
        echo -e "${YELLOW}Application is not running${NC}"
        log_message "INFO" "Stop attempt - Application not running"
        return 1
    fi

    local pid=$(cat "$PID_FILE")
    local port=$(get_port)
    echo -e "${BLUE}Stopping application on port $port (PID: $pid)...${NC}"
    log_message "INFO" "Stopping application on port $port with PID $pid"

    # Try graceful shutdown first
    kill "$pid" 2>/dev/null
    
    # Wait for graceful shutdown
    local count=0
    while [ $count -lt 10 ]; do
        if ! ps -p "$pid" > /dev/null 2>&1; then
            break
        fi
        sleep 1
        count=$((count + 1))
    done

    # Force kill if still running
    if ps -p "$pid" > /dev/null 2>&1; then
        echo -e "${YELLOW}Force killing application...${NC}"
        log_message "WARNING" "Force killing application with PID $pid"
        kill -9 "$pid" 2>/dev/null
        sleep 1
    fi

    # Clean up
    rm -f "$PID_FILE"
    
    if ! ps -p "$pid" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Application stopped successfully${NC}"
        log_message "SUCCESS" "Application stopped successfully"
    else
        echo -e "${RED}✗ Failed to stop application${NC}"
        log_message "ERROR" "Failed to stop application"
        return 1
    fi
}

# Function to restart the application
restart_app() {
    echo -e "${BLUE}Restarting application...${NC}"
    log_message "INFO" "Restarting application"
    
    stop_app
    sleep 2
    start_app
}

# Function to show status
show_status() {
    local port=$(get_port)
    echo -e "${BLUE}Application Status:${NC}"
    echo -e "Port: $port"
    
    if is_running; then
        local pid=$(cat "$PID_FILE")
        echo -e "Status: ${GREEN}Running${NC}"
        echo -e "PID: $pid"
        echo -e "URL: http://localhost:$port"
        log_message "INFO" "Status check - Running on port $port with PID $pid"
    else
        echo -e "Status: ${RED}Stopped${NC}"
        log_message "INFO" "Status check - Application stopped"
    fi
}

# Function to show logs
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo -e "${BLUE}Recent logs (last 50 lines):${NC}"
        tail -n 50 "$LOG_FILE"
    else
        echo -e "${YELLOW}No log file found${NC}"
    fi
}

# Function to show help
show_help() {
    echo -e "${BLUE}Next.js Application Management Script${NC}"
    echo ""
    echo "Usage: $0 {start|stop|restart|status|logs|help}"
    echo ""
    echo "Commands:"
    echo "  start    - Start the application"
    echo "  stop     - Stop the application"
    echo "  restart  - Restart the application"
    echo "  status   - Show application status"
    echo "  logs     - Show recent logs"
    echo "  help     - Show this help message"
    echo ""
    echo "Configuration:"
    echo "  PORT is read from: $ENV_FILE"
    echo "  Logs are stored in: $LOG_FILE"
    echo "  PID file: $PID_FILE"
}

# Main script logic
case "$1" in
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        restart_app
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Error: Invalid command '$1'${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac

exit 0