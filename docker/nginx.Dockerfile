# syntax=docker/dockerfile:1

FROM nginx:1.27-alpine

RUN apk add --no-cache openssl bash

# Generate self-signed cert if not provided via volume
RUN mkdir -p /etc/nginx/certs && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/certs/server.key \
      -out /etc/nginx/certs/server.crt \
      -subj "/C=ID/ST=ID/O=MDVA, Inc./CN=localhost"

COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/site.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]


