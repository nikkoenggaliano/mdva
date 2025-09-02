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
echo "✅ Docker Compose check passed!"
echo "✅ Script can continue..."
