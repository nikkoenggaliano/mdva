#!/bin/bash

# Function to check if docker-compose is available
check_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        echo "docker-compose"
        return 0
    elif docker compose version &> /dev/null; then
        echo "docker compose"
        return 0
    else
        return 1
    fi
}

# Check for docker-compose availability
DOCKER_COMPOSE_CMD=$(check_docker_compose)
if [ $? -ne 0 ]; then
    echo "❌ Error: Neither 'docker-compose' nor 'docker compose' is available!"
    echo ""
    echo "Please install Docker Compose:"
    echo "  - For docker-compose: https://docs.docker.com/compose/install/"
    echo "  - For docker compose: Update Docker to latest version"
    echo ""
    echo "Or check if Docker is running:"
    echo "  docker --version"
    echo "  docker info"
    exit 1
fi

echo "✅ Using: $DOCKER_COMPOSE_CMD"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "No .env file found. Using default values."
fi

# Set defaults
SSL_ENABLED=${SSL_ENABLED:-false}
FRONTEND_HTTP_PORT=${FRONTEND_HTTP_PORT:-8080}
FRONTEND_HTTPS_PORT=${FRONTEND_HTTPS_PORT:-8081}
BACKEND_HTTP_PORT=${BACKEND_HTTP_PORT:-3001}
BACKEND_HTTPS_PORT=${BACKEND_HTTPS_PORT:-3002}

echo "=== MDVA Docker Configuration ==="
echo "SSL Enabled: $SSL_ENABLED"
echo "Frontend HTTP Port: $FRONTEND_HTTP_PORT"
echo "Frontend HTTPS Port: $FRONTEND_HTTPS_PORT"
echo "Backend HTTP Port: $BACKEND_HTTP_PORT"
echo "Backend HTTPS Port: $BACKEND_HTTPS_PORT"
echo "================================"

# Generate nginx configuration
echo "Generating nginx configuration..."
./generate-nginx-config.sh

# Check if SSL is enabled and certificates exist
if [ "$SSL_ENABLED" = "true" ]; then
    if [ ! -f "certs/server.crt" ] || [ ! -f "certs/server.key" ]; then
        echo "Warning: SSL is enabled but certificates are missing!"
        echo "Please place your SSL certificates in the 'certs' folder:"
        echo "  - certs/server.crt"
        echo "  - certs/server.key"
        echo ""
        echo "Or set SSL_ENABLED=false in your .env file"
        exit 1
    fi
fi

# Start services
echo "Starting Docker services..."
$DOCKER_COMPOSE_CMD up -d

echo ""
echo "Services started successfully!"
echo "Frontend: http://localhost:$FRONTEND_HTTP_PORT"
if [ "$SSL_ENABLED" = "true" ]; then
    echo "Frontend (HTTPS): https://localhost:$FRONTEND_HTTPS_PORT"
fi
echo "Backend API: http://localhost:$FRONTEND_HTTP_PORT/api"
echo "Database: localhost:3306"
echo ""
echo "To view logs: $DOCKER_COMPOSE_CMD logs -f"
echo "To stop services: $DOCKER_COMPOSE_CMD down"
