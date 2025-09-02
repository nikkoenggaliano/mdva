#!/bin/bash

echo "🔍 MDVA Docker Debug Tool"
echo "========================"

# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env file found"
    echo "📋 Current configuration:"
    grep -E "^(SSL_ENABLED|FRONTEND_HTTP_PORT|FRONTEND_HTTPS_PORT|BACKEND_HTTP_PORT|BACKEND_HTTPS_PORT)=" .env | while read line; do
        echo "  $line"
    done
else
    echo "❌ .env file not found"
    echo "💡 Run: cp env.template .env"
    exit 1
fi

echo ""
echo "🐳 Docker Status:"
echo "================="

# Check if docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running or not accessible"
    echo "💡 Start Docker: sudo systemctl start docker"
    exit 1
fi

echo "✅ Docker is running"

# Check containers
echo ""
echo "📦 Container Status:"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔍 Nginx Configuration:"
echo "======================"

# Check if nginx config exists
if [ -f "nginx/site.conf" ]; then
    echo "✅ nginx/site.conf exists"
    echo "📋 First few lines:"
    head -10 nginx/site.conf
else
    echo "❌ nginx/site.conf not found"
    echo "💡 Run: ./generate-nginx-config.sh"
fi

echo ""
echo "🔐 SSL Certificates:"
echo "===================="

# Check SSL certificates
if [ -f "certs/server.crt" ] && [ -f "certs/server.key" ]; then
    echo "✅ SSL certificates found"
    echo "📋 Certificate info:"
    openssl x509 -in certs/server.crt -text -noout | grep -E "(Subject:|Not Before:|Not After:)" | head -3
else
    echo "❌ SSL certificates not found"
    echo "💡 Place certificates in certs/ folder or generate new ones"
fi

echo ""
echo "🌐 Port Check:"
echo "============="

# Check if ports are in use
FRONTEND_HTTP_PORT=$(grep FRONTEND_HTTP_PORT .env | cut -d'=' -f2)
FRONTEND_HTTPS_PORT=$(grep FRONTEND_HTTPS_PORT .env | cut -d'=' -f2)
BACKEND_HTTP_PORT=$(grep BACKEND_HTTP_PORT .env | cut -d'=' -f2)

echo "Frontend HTTP Port ($FRONTEND_HTTP_PORT):"
if lsof -i :$FRONTEND_HTTP_PORT &> /dev/null; then
    echo "  ❌ Port $FRONTEND_HTTP_PORT is in use"
    lsof -i :$FRONTEND_HTTP_PORT
else
    echo "  ✅ Port $FRONTEND_HTTP_PORT is available"
fi

echo "Frontend HTTPS Port ($FRONTEND_HTTPS_PORT):"
if lsof -i :$FRONTEND_HTTPS_PORT &> /dev/null; then
    echo "  ❌ Port $FRONTEND_HTTPS_PORT is in use"
    lsof -i :$FRONTEND_HTTPS_PORT
else
    echo "  ✅ Port $FRONTEND_HTTPS_PORT is available"
fi

echo "Backend HTTP Port ($BACKEND_HTTP_PORT):"
if lsof -i :$BACKEND_HTTP_PORT &> /dev/null; then
    echo "  ❌ Port $BACKEND_HTTP_PORT is in use"
    lsof -i :$BACKEND_HTTP_PORT
else
    echo "  ✅ Port $BACKEND_HTTP_PORT is available"
fi

echo ""
echo "📊 Recent Logs:"
echo "==============="

# Show recent logs if containers are running
if docker ps --format "{{.Names}}" | grep -q "mdva-web"; then
    echo "🌐 Web container logs (last 10 lines):"
    docker logs --tail 10 mdva-web
else
    echo "❌ Web container not running"
fi

echo ""
echo "💡 Troubleshooting Tips:"
echo "========================"
echo "1. If nginx config error: Run ./generate-nginx-config.sh"
echo "2. If port conflict: Change ports in .env file"
echo "3. If SSL error: Check certificates in certs/ folder"
echo "4. If container won't start: Check logs with docker logs <container_name>"
echo "5. To restart all: docker-compose down && docker-compose up -d"
