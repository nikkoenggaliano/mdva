#!/bin/bash

echo "🚀 MDVA Fix Now - Langsung Fix!"
echo "================================"

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

# Remove all images
echo "🗑️ Removing all images..."
docker rmi docker_web docker_frontend docker_backend 2>/dev/null || true

# Clean up everything
echo "🧹 Cleaning up everything..."
rm -rf nginx/
docker system prune -f

# Create fresh nginx directory
echo "📁 Creating fresh nginx directory..."
mkdir -p nginx

# Generate new nginx config
echo "🔧 Generating new nginx config..."
./generate-nginx-config.sh

# Check if config was generated
if [ ! -f "nginx/site.conf" ]; then
    echo "❌ Failed to generate nginx config!"
    exit 1
fi

echo "✅ Nginx config generated successfully"

# Show the config
echo ""
echo "📋 Generated nginx config:"
echo "=========================="
cat nginx/site.conf

# Build and start services
echo ""
echo "🔨 Building and starting services..."
$DOCKER_COMPOSE_CMD up -d --build

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 15

# Check container status
echo ""
echo "📊 Container Status:"
$DOCKER_COMPOSE_CMD ps

# Check if web container is running
if docker ps --format "{{.Names}}" | grep -q "mdva-web"; then
    echo ""
    echo "✅ Web container is running!"
    
    # Check nginx config inside container
    echo ""
    echo "🔍 Checking nginx config inside container..."
    echo "📁 Contents of /etc/nginx/conf.d/:"
    docker exec mdva-web ls -la /etc/nginx/conf.d/
    
    echo ""
    echo "📄 Contents of default.conf:"
    docker exec mdva-web cat /etc/nginx/conf.d/default.conf
    
    echo ""
    echo "📊 Nginx process status:"
    docker exec mdva-web ps aux | grep nginx
    
    echo ""
    echo "🌐 Testing nginx..."
    docker exec mdva-web nginx -t
    
else
    echo ""
    echo "❌ Web container failed to start"
    echo "📊 Container logs:"
    $DOCKER_COMPOSE_CMD logs web
    exit 1
fi

echo ""
echo "🎉 Fix completed successfully!"
echo ""
echo "🌐 Frontend: http://localhost:$(grep FRONTEND_HTTP_PORT .env | cut -d'=' -f2)"
echo "🔒 Backend: http://localhost:$(grep BACKEND_HTTP_PORT .env | cut -d'=' -f2)"
echo "🗄️  Database: localhost:3306"
echo ""
echo "📊 View logs: $DOCKER_COMPOSE_CMD logs -f"
echo "🔍 Debug: ./debug.sh"
