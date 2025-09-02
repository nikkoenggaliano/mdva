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

echo "🚀 MDVA Quick Start"
echo "=================="
echo "✅ Using: $DOCKER_COMPOSE_CMD"

# Check if .env exists, if not create from template
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.template .env
    echo "✅ .env file created!"
fi

# Show current configuration
echo ""
echo "📋 Current Configuration:"
echo "------------------------"
if [ -f .env ]; then
    grep -E "^(SSL_ENABLED|FRONTEND_HTTP_PORT|FRONTEND_HTTPS_PORT|BACKEND_HTTP_PORT|BACKEND_HTTPS_PORT)=" .env | while read line; do
        echo "  $line"
    done
fi

echo ""
echo "🔧 To change configuration, run:"
echo "   ./configure.sh --help"
echo ""
echo "🌐 Starting services..."

# Generate nginx config
./generate-nginx-config.sh

# Start services
$DOCKER_COMPOSE_CMD up -d

echo ""
echo "✅ Services started successfully!"
echo ""
echo "📱 Frontend: http://localhost:$(grep FRONTEND_HTTP_PORT .env | cut -d'=' -f2)"
echo "🔒 Backend: http://localhost:$(grep FRONTEND_HTTP_PORT .env | cut -d'=' -f2)/api"
echo "🗄️  Database: localhost:3306"
echo ""
echo "📊 View logs: $DOCKER_COMPOSE_CMD logs -f"
echo "🛑 Stop services: $DOCKER_COMPOSE_CMD down"
