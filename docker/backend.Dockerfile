# syntax=docker/dockerfile:1

FROM oven/bun:1 as base
WORKDIR /app
COPY backend /app/backend
COPY backend/package.json /app/backend/package.json
RUN mkdir -p /app/backend/uploads/messages /app/backend/uploads/profile
WORKDIR /app/backend
RUN bun install --frozen-lockfile || true

EXPOSE 3001
CMD ["bun", "run", "src/app.js"]


