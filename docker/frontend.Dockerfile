# syntax=docker/dockerfile:1

FROM node:20-alpine as build
WORKDIR /app
COPY frontend /app/frontend
WORKDIR /app/frontend
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund
RUN npm run build

FROM nginx:1.27-alpine as runtime
WORKDIR /usr/share/nginx/html
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY docker/nginx/frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80


