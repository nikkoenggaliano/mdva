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

# Function to show usage
show_usage() {
    echo "🚀 MDVA Backend + MySQL Runner"
    echo "=============================="
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  (no args)     Run normally with current config"
    echo "  --fix         Fix backend issues and restart"
    echo "  --clean       Clean everything and rebuild from scratch"
    echo "  --super-clean Super clean - remove MDVA containers/images only"
    echo "  --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Run normally"
    echo "  $0 --fix        # Fix backend issues"
    echo "  $0 --clean      # Clean and rebuild"
    echo "  $0 --super-clean # Clean MDVA containers/images only"
}

# Function to check if .env exists
check_env() {
    if [ ! -f .env ]; then
        echo "📝 Creating .env file from template..."
        cp env.template .env
        echo "✅ .env file created!"
    fi
}

# Function to run normally
run_normal() {
    echo "🚀 Starting MDVA Backend + MySQL services..."
    
    # Check environment
    check_env
    
    # Start services
    $DOCKER_COMPOSE_CMD up -d
    
    echo ""
    echo "✅ Services started successfully!"
    show_status
}

# Function to fix backend issues
run_fix() {
    echo "🔧 Fixing backend issues..."
    
    # Stop backend container
    echo "🛑 Stopping backend container..."
    $DOCKER_COMPOSE_CMD stop backend
    
    # Remove backend container
    echo "🗑️ Removing backend container..."
    $DOCKER_COMPOSE_CMD rm -f backend
    
    # Rebuild and start backend container
    echo "🔨 Rebuilding backend container..."
    $DOCKER_COMPOSE_CMD build backend
    $DOCKER_COMPOSE_CMD up -d backend
    
    # Wait and check
    echo "⏳ Waiting for container to start... (10 seconds)"
    sleep 10
    
    echo ""
    echo "✅ Fix completed!"
    show_status
}

# Function to clean and rebuild
run_clean() {
    echo "🧹 Cleaning and rebuilding MDVA services..."
    
    # Stop all MDVA containers
    echo "🛑 Stopping all MDVA containers..."
    $DOCKER_COMPOSE_CMD down
    
    # Remove only MDVA images
    echo "🗑️ Removing MDVA images..."
    docker rmi docker_backend 2>/dev/null || true
    
    # Clean up only MDVA related Docker resources
    echo "🧹 Cleaning up MDVA Docker resources..."
    docker system prune -f
    
    # Build and start
    echo "🔨 Building and starting MDVA services..."
    $DOCKER_COMPOSE_CMD up -d --build
    
    # Wait and check
    echo "⏳ Waiting for services to start... (15 seconds)"
    sleep 15
    
    echo ""
    echo "✅ Clean rebuild completed!"
    show_status
}

# Function to super clean MDVA only
run_super_clean() {
    echo "🧹🧹🧹 SUPER CLEAN - MDVA Only!"
    echo "================================="
    
    # Stop and remove only MDVA containers
    echo "🛑 Stopping and removing MDVA containers..."
    $DOCKER_COMPOSE_CMD down --volumes --remove-orphans
    
    # Remove only MDVA containers by name
    echo "🗑️ Removing MDVA containers by name..."
    docker rm -f mdva-backend mdva-db 2>/dev/null || true
    
    # Remove only MDVA images
    echo "🗑️ Removing MDVA images..."
    docker rmi docker_backend 2>/dev/null || true
    
    # Clean up only MDVA related Docker resources (not all)
    echo "🧹 Cleaning up MDVA Docker resources..."
    docker system prune -f
    
    # Build and start
    echo "🔨 Building and starting MDVA services..."
    $DOCKER_COMPOSE_CMD up -d --build
    
    # Wait and check
    echo "⏳ Waiting for services to start... (20 seconds)"
    sleep 20
    
    echo ""
    echo "🎉 Super clean completed (MDVA only)!"
    show_status
}

# Function to show status
show_status() {
    echo ""
    echo "📊 Service Status:"
    echo "=================="
    $DOCKER_COMPOSE_CMD ps
    
    echo ""
    echo "🔒 Backend API: http://localhost:$(grep backend_port .env | cut -d'=' -f2)"
    echo "🗄️  Database: localhost:$(grep database_port .env | cut -d'=' -f2) (internal only)"
    echo ""
    echo "📊 View logs: $DOCKER_COMPOSE_CMD logs -f"
    echo "🔍 Debug: ./debug.sh"
}

# Main script
if [ $# -eq 0 ]; then
    # No arguments - run normally
    DOCKER_COMPOSE_CMD=$(check_docker_compose)
    if [ $? -ne 0 ]; then
        echo "❌ Error: Neither 'docker-compose' nor 'docker compose' is available!"
        exit 1
    fi
    
    echo "✅ Using: $DOCKER_COMPOSE_CMD"
    run_normal
    
elif [ "$1" = "--fix" ]; then
    # Fix backend issues
    DOCKER_COMPOSE_CMD=$(check_docker_compose)
    if [ $? -ne 0 ]; then
        echo "❌ Error: Neither 'docker-compose' nor 'docker compose' is available!"
        exit 1
    fi
    
    echo "✅ Using: $DOCKER_COMPOSE_CMD"
    run_fix
    
elif [ "$1" = "--clean" ]; then
    # Clean and rebuild
    DOCKER_COMPOSE_CMD=$(check_docker_compose)
    if [ $? -ne 0 ]; then
        echo "❌ Error: Neither 'docker-compose' nor 'docker compose' is available!"
        exit 1
    fi
    
    echo "✅ Using: $DOCKER_COMPOSE_CMD"
    run_clean
    
elif [ "$1" = "--super-clean" ]; then
    # Super clean MDVA only
    DOCKER_COMPOSE_CMD=$(check_docker_compose)
    if [ $? -ne 0 ]; then
        echo "❌ Error: Neither 'docker-compose' nor 'docker compose' is available!"
        exit 1
    fi
    
    echo "✅ Using: $DOCKER_COMPOSE_CMD"
    run_super_clean
    
elif [ "$1" = "--help" ]; then
    # Show help
    show_usage
    
else
    # Invalid argument
    echo "❌ Invalid option: $1"
    echo ""
    show_usage
    exit 1
fi
