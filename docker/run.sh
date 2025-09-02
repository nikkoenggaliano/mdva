#!/bin/bash

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
docker-compose up -d

echo ""
echo "Services started successfully!"
echo "Frontend: http://localhost:$FRONTEND_HTTP_PORT"
if [ "$SSL_ENABLED" = "true" ]; then
    echo "Frontend (HTTPS): https://localhost:$FRONTEND_HTTPS_PORT"
fi
echo "Backend API: http://localhost:$FRONTEND_HTTP_PORT/api"
echo "Database: localhost:3306"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop services: docker-compose down"
