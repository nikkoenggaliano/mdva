#!/bin/bash

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --ssl <true|false>           Enable/disable SSL (default: false)"
    echo "  --frontend-http-port <port>  Set frontend HTTP port (default: 8080)"
    echo "  --frontend-https-port <port> Set frontend HTTPS port (default: 8081)"
    echo "  --backend-http-port <port>   Set backend HTTP port (default: 3001)"
    echo "  --backend-https-port <port>  Set backend HTTPS port (default: 3002)"
    echo "  --db-user <user>             Set database user (default: mdva)"
    echo "  --db-pass <password>         Set database password (default: root)"
    echo "  --db-name <name>             Set database name (default: mdva)"
    echo "  --jwt-secret <secret>        Set JWT secret (default: mdva_prod_secret_2024)"
    echo "  --show                       Show current configuration"
    echo "  --reset                      Reset to default configuration"
    echo "  --help                       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --ssl true --frontend-http-port 3000 --frontend-https-port 3001"
    echo "  $0 --frontend-http-port 9090"
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

# ========================================
# SSL CONFIGURATION
# ========================================
# Enable or disable SSL
# true = SSL enabled (HTTPS)
# false = SSL disabled (HTTP only)
SSL_ENABLED=false

# ========================================
# FRONTEND PORTS
# ========================================
# Port untuk frontend HTTP
FRONTEND_HTTP_PORT=8080

# Port untuk frontend HTTPS (jika SSL enabled)
FRONTEND_HTTPS_PORT=8081

# ========================================
# BACKEND PORTS
# ========================================
# Port untuk backend HTTP
BACKEND_HTTP_PORT=3001

# Port untuk backend HTTPS (jika SSL enabled)
BACKEND_HTTPS_PORT=3002

# ========================================
# DATABASE CONFIGURATION
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
# Gunakan string yang panjang dan random untuk production
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

# ========================================
# SSL CONFIGURATION
# ========================================
# Enable or disable SSL
# true = SSL enabled (HTTPS)
# false = SSL disabled (HTTP only)
SSL_ENABLED=false

# ========================================
# FRONTEND PORTS
# ========================================
# Port untuk frontend HTTP
FRONTEND_HTTP_PORT=8080

# Port untuk frontend HTTPS (jika SSL enabled)
FRONTEND_HTTPS_PORT=8081

# ========================================
# BACKEND PORTS
# ========================================
# Port untuk backend HTTP
BACKEND_HTTP_PORT=3001

# Port untuk backend HTTPS (jika SSL enabled)
BACKEND_HTTPS_PORT=3002

# ========================================
# DATABASE CONFIGURATION
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
# Gunakan string yang panjang dan random untuk production
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
        --ssl)
            if [[ "$2" =~ ^(true|false)$ ]]; then
                update_config "SSL_ENABLED" "$2"
                shift 2
            else
                echo "Error: SSL value must be 'true' or 'false'"
                exit 1
            fi
            ;;
        --frontend-http-port)
            if [[ "$2" =~ ^[0-9]+$ ]] && [ "$2" -ge 1 ] && [ "$2" -le 65535 ]; then
                update_config "FRONTEND_HTTP_PORT" "$2"
                shift 2
            else
                echo "Error: Frontend HTTP port must be a number between 1-65535"
                exit 1
            fi
            ;;
        --frontend-https-port)
            if [[ "$2" =~ ^[0-9]+$ ]] && [ "$2" -ge 1 ] && [ "$2" -le 65535 ]; then
                update_config "FRONTEND_HTTPS_PORT" "$2"
                shift 2
            else
                echo "Error: Frontend HTTPS port must be a number between 1-65535"
                exit 1
            fi
            ;;
        --backend-http-port)
            if [[ "$2" =~ ^[0-9]+$ ]] && [ "$2" -ge 1 ] && [ "$2" -le 65535 ]; then
                update_config "BACKEND_HTTP_PORT" "$2"
                shift 2
            else
                echo "Error: Backend HTTP port must be a number between 1-65535"
                exit 1
            fi
            ;;
        --backend-https-port)
            if [[ "$2" =~ ^[0-9]+$ ]] && [ "$2" -ge 1 ] && [ "$2" -le 65535 ]; then
                update_config "BACKEND_HTTPS_PORT" "$2"
                shift 2
            else
                echo "Error: Backend HTTPS port must be a number between 1-65535"
                exit 1
            fi
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
