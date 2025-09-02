#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set defaults
SSL_ENABLED=${SSL_ENABLED:-false}
FRONTEND_HTTP_PORT=${FRONTEND_HTTP_PORT:-8080}
FRONTEND_HTTPS_PORT=${FRONTEND_HTTPS_PORT:-8081}
BACKEND_HTTP_PORT=${BACKEND_HTTP_PORT:-3001}
BACKEND_HTTPS_PORT=${BACKEND_HTTPS_PORT:-3002}

echo "Generating nginx configuration..."
echo "SSL_ENABLED: $SSL_ENABLED"
echo "FRONTEND_HTTP_PORT: $FRONTEND_HTTP_PORT"
echo "FRONTEND_HTTPS_PORT: $FRONTEND_HTTPS_PORT"
echo "BACKEND_HTTP_PORT: $BACKEND_HTTP_PORT"
echo "BACKEND_HTTPS_PORT: $BACKEND_HTTPS_PORT"

# Create nginx config directory if it doesn't exist
mkdir -p nginx

if [ "$SSL_ENABLED" = "true" ]; then
    echo "Generating SSL-enabled configuration..."
    cat > nginx/site.conf << EOF
map \$http_upgrade \$connection_upgrade {
  default upgrade;
  ''      close;
}

server {
  listen 80;
  server_name _;
  return 301 https://\$host\$request_uri;
}

server {
  listen 443 ssl http2;
  server_name _;

  ssl_certificate     /etc/nginx/certs/server.crt;
  ssl_certificate_key /etc/nginx/certs/server.key;

  # Static frontend
  location / {
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    root /usr/share/nginx/html;
    try_files \$uri \$uri/ /index.html;
  }

  # Backend API
  location /api/ {
    proxy_pass http://backend:${BACKEND_HTTP_PORT};
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection \$connection_upgrade;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  # File uploads
  location /uploads/ {
    proxy_pass http://backend:${BACKEND_HTTP_PORT}/uploads/;
  }
}
EOF
else
    echo "Generating HTTP-only configuration..."
    cat > nginx/site.conf << EOF
map \$http_upgrade \$connection_upgrade {
  default upgrade;
  ''      close;
}

server {
  listen 80;
  server_name _;

  # Static frontend
  location / {
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    root /usr/share/nginx/html;
    try_files \$uri \$uri/ /index.html;
  }

  # Backend API
  location /api/ {
    proxy_pass http://backend:${BACKEND_HTTP_PORT};
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection \$connection_upgrade;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  # File uploads
  location /uploads/ {
    proxy_pass http://backend:${BACKEND_HTTP_PORT}/uploads/;
  }
}
EOF
fi

echo "Nginx configuration generated successfully!"
echo "Configuration file: nginx/site.conf"
