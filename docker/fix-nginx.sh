#!/bin/bash

echo "🔧 MDVA Nginx Fix Tool"
echo "======================"

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

# Stop web container first
echo "🛑 Stopping web container..."
$DOCKER_COMPOSE_CMD stop web

# Remove web container
echo "🗑️ Removing web container..."
$DOCKER_COMPOSE_CMD rm -f web

# Clean up nginx config directory
echo "🧹 Cleaning up nginx config..."
rm -rf nginx/
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

# Rebuild and start web container
echo ""
echo "🔨 Rebuilding web container..."
$DOCKER_COMPOSE_CMD build web

echo "🚀 Starting web container..."
$DOCKER_COMPOSE_CMD up -d web

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 10

# Check container status
echo ""
echo "📊 Container Status:"
$DOCKER_COMPOSE_CMD ps web

# Check nginx config inside container
echo ""
echo "🔍 Checking nginx config inside container..."
if docker ps --format "{{.Names}}" | grep -q "mdva-web"; then
    echo "✅ Container is running"
    echo "📁 Contents of /etc/nginx/conf.d/:"
    docker exec mdva-web ls -la /etc/nginx/conf.d/
    
    echo ""
    echo "📄 Contents of default.conf:"
    docker exec mdva-web cat /etc/nginx/conf.d/default.conf
    
    echo ""
    echo "📊 Nginx process status:"
    docker exec mdva-web ps aux | grep nginx
else
    echo "❌ Container failed to start"
    echo "📊 Container logs:"
    $DOCKER_COMPOSE_CMD logs web
fi

echo ""
echo "✅ Nginx fix completed!"
echo ""
echo "💡 If still having issues, try:"
echo "   ./restart.sh --clean"
