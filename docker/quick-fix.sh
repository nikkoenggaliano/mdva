#!/bin/bash

echo "🚀 MDVA Quick Fix"
echo "================="

# Stop all containers
echo "🛑 Stopping all containers..."
docker-compose down

# Clean up everything
echo "🧹 Cleaning up everything..."
rm -rf nginx/
docker system prune -f

# Generate new config
echo "🔧 Generating new nginx config..."
mkdir -p nginx
./generate-nginx-config.sh

# Start services
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "✅ Quick fix completed!"
echo "🌐 Frontend: http://localhost:$(grep FRONTEND_HTTP_PORT .env | cut -d'=' -f2)"
echo "🔒 Backend: http://localhost:$(grep BACKEND_HTTP_PORT .env | cut -d'=' -f2)"
echo ""
echo "📊 Check status: docker-compose ps"
echo "📋 Check logs: docker-compose logs web"
