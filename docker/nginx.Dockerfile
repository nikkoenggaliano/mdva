# syntax=docker/dockerfile:1

FROM nginx:1.27-alpine

RUN apk add --no-cache openssl bash

# Generate self-signed cert if not provided via volume
RUN mkdir -p /etc/nginx/certs && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/certs/server.key \
      -out /etc/nginx/certs/server.crt \
      -subj "/C=ID/ST=ID/O=MDVA, Inc./CN=localhost"

# Remove any existing config files in conf.d
RUN rm -f /etc/nginx/conf.d/*.conf

# Copy only the site configuration
COPY docker/nginx/site.conf /etc/nginx/conf.d/default.conf

# Verify the config file exists and is correct
RUN ls -la /etc/nginx/conf.d/ && \
    cat /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]


