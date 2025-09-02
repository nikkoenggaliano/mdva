#!/bin/bash

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --backend-port <port>      Set backend port (default: 3001)"
    echo "  --backend-bind <bind>      Set backend bind address (default: 0.0.0.0)"
    echo "  --database-port <port>     Set database port (default: 3002)"
    echo "  --database-bind <bind>     Set database bind address (default: 127.0.0.1)"
    echo "  --db-user <user>           Set database user (default: mdva)"
    echo "  --db-pass <password>       Set database password (default: root)"
    echo "  --db-name <name>           Set database name (default: mdva)"
    echo "  --jwt-secret <secret>      Set JWT secret (default: mdva_prod_secret_2024)"
    echo "  --show                     Show current configuration"
    echo "  --reset                    Reset to default configuration"
    echo "  --help                     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --backend-port 4000"
    echo "  $0 --backend-bind 0.0.0.0 --database-port 3003"
    echo "  $0 --db-user admin --db-pass mypassword"
    echo "  $0 --show"
    echo "  $0 --reset"
}

# Function to show current configuration
show_config() {
    if [ -f .env ]; then
        echo "Current configuration (.env):"
        cat .env
    else
        echo "No .env file found. Using default configuration."
    fi
    echo ""
    echo "To apply changes, run: ./run.sh"
}

# Function to reset configuration
reset_config() {
    echo "Resetting to default configuration..."
    cat > .env << EOF
# ========================================
# MDVA DOCKER CONFIGURATION
# ========================================
# BACKEND + MYSQL ONLY - SIMPLE CONFIG
# ========================================

# ========================================
# BACKEND CONFIGURATION
# ========================================
# Port untuk backend API (akan di-expose ke host)
backend_port=3001

# Bind address untuk backend (0.0.0.0 = expose all interfaces)
backend_bind=0.0.0.0

# ========================================
# DATABASE CONFIGURATION
# ========================================
# Port untuk database (internal only, tidak di-expose)
database_port=3002

# Bind address untuk database (127.0.0.1 = localhost only)
database_bind=127.0.0.1

# ========================================
# DATABASE CREDENTIALS
# ========================================
# Database username
DB_USER=mdva

# Database password
DB_PASS=root

# Database name
DB_NAME=mdva

# ========================================
# JWT SECRET
# ========================================
# Secret key untuk JWT authentication
JWT_SECRET=mdva_prod_secret_2024
EOF
    echo "Configuration reset to defaults!"
    echo "To apply changes, run: ./run.sh"
}

# Function to update configuration
update_config() {
    local key=$1
    local value=$2
    
    if [ -f .env ]; then
        # Update existing .env file
        if grep -q "^${key}=" .env; then
            sed -i.bak "s/^${key}=.*/${key}=${value}/" .env
        else
            echo "${key}=${value}" >> .env
        fi
    else
        # Create new .env file with default values
        cat > .env << EOF
# ========================================
# MDVA DOCKER CONFIGURATION
# ========================================
# BACKEND + MYSQL ONLY - SIMPLE CONFIG
# ========================================

# ========================================
# BACKEND CONFIGURATION
# ========================================
# Port untuk backend API (akan di-expose ke host)
backend_port=3001

# Bind address untuk backend (0.0.0.0 = expose all interfaces)
backend_bind=0.0.0.0

# ========================================
# DATABASE CONFIGURATION
# ========================================
# Port untuk database (internal only, tidak di-expose)
database_port=3002

# Bind address untuk database (127.0.0.1 = localhost only)
database_bind=127.0.0.1

# ========================================
# DATABASE CREDENTIALS
# ========================================
# Database username
DB_USER=mdva

# Database password
DB_PASS=root

# Database name
DB_NAME=mdva

# ========================================
# JWT SECRET
# ========================================
# Secret key untuk JWT authentication
JWT_SECRET=mdva_prod_secret_2024
EOF
        # Update the specific key
        sed -i.bak "s/^${key}=.*/${key}=${value}/" .env
    fi
    
    echo "Updated ${key}=${value}"
}

# Main script
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

while [[ $# -gt 0 ]]; do
    case $1 in
        --backend-port)
            if [[ "$2" =~ ^[0-9]+$ ]] && [ "$2" -ge 1 ] && [ "$2" -le 65535 ]; then
                update_config "backend_port" "$2"
                shift 2
            else
                echo "Error: Backend port must be a number between 1-65535"
                exit 1
            fi
            ;;
        --backend-bind)
            update_config "backend_bind" "$2"
            shift 2
            ;;
        --database-port)
            if [[ "$2" =~ ^[0-9]+$ ]] && [ "$2" -ge 1 ] && [ "$2" -le 65535 ]; then
                update_config "database_port" "$2"
                shift 2
            else
                echo "Error: Database port must be a number between 1-65535"
                exit 1
            fi
            ;;
        --database-bind)
            update_config "database_bind" "$2"
            shift 2
            ;;
        --db-user)
            update_config "DB_USER" "$2"
            shift 2
            ;;
        --db-pass)
            update_config "DB_PASS" "$2"
            shift 2
            ;;
        --db-name)
            update_config "DB_NAME" "$2"
            shift 2
            ;;
        --jwt-secret)
            update_config "JWT_SECRET" "$2"
            shift 2
            ;;
        --show)
            show_config
            exit 0
            ;;
        --reset)
            reset_config
            exit 0
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

echo ""
echo "Configuration updated successfully!"
echo "To apply changes, run: ./run.sh"
