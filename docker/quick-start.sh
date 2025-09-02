#!/bin/bash

echo "🚀 MDVA Quick Start"
echo "=================="

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
docker-compose up -d

echo ""
echo "✅ Services started successfully!"
echo ""
echo "📱 Frontend: http://localhost:$(grep FRONTEND_HTTP_PORT .env | cut -d'=' -f2)"
echo "🔒 Backend: http://localhost:$(grep FRONTEND_HTTP_PORT .env | cut -d'=' -f2)/api"
echo "🗄️  Database: localhost:3306"
echo ""
echo "📊 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
