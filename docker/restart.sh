#!/bin/bash

echo "🔄 MDVA Docker Restart Tool"
echo "=========================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    echo "💡 Run: cp env.template .env"
    exit 1
fi

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
    exit 1
fi

echo "✅ Using: $DOCKER_COMPOSE_CMD"

# Stop all containers
echo "🛑 Stopping all containers..."
$DOCKER_COMPOSE_CMD down

# Remove old nginx config
echo "🧹 Cleaning up old nginx config..."
rm -f nginx/site.conf

# Generate new nginx config
echo "🔧 Generating new nginx config..."
./generate-nginx-config.sh

# Remove old containers and images (optional)
if [ "$1" = "--clean" ]; then
    echo "🧹 Cleaning up old containers and images..."
    $DOCKER_COMPOSE_CMD down --rmi all --volumes --remove-orphans
    docker system prune -f
fi

# Start services
echo "🚀 Starting services..."
$DOCKER_COMPOSE_CMD up -d

# Wait a bit for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check status
echo ""
echo "📊 Service Status:"
echo "=================="
$DOCKER_COMPOSE_CMD ps

echo ""
echo "✅ Restart completed!"
echo ""
echo "🌐 Frontend: http://localhost:$(grep FRONTEND_HTTP_PORT .env | cut -d'=' -f2)"
echo "🔒 Backend: http://localhost:$(grep BACKEND_HTTP_PORT .env | cut -d'=' -f2)"
echo "🗄️  Database: localhost:3306"
echo ""
echo "📊 View logs: $DOCKER_COMPOSE_CMD logs -f"
echo "🔍 Debug: ./debug.sh"
